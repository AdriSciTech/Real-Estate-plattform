// components/PropertyInfo.tsx
'use client';
import React, { memo } from 'react';
import { Property } from '@rental/types';

interface PropertyInfoProps {
  property: Property;
}

const PropertyInfo = memo(({ property }: PropertyInfoProps) => {
  const checkInOutInfo = [
    {
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      label: "Check-in",
      value: "3:00 PM",
      description: "Self check-in available"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      label: "Check-out", 
      value: "11:00 AM",
      description: "Late checkout available"
    }
  ];

  const policies = [
    {
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Age Requirement",
      description: "Minimum age of 21 to book",
      status: "required"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
      title: "Pet Policy",
      description: "Pets welcome with prior approval",
      status: "allowed"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Smoking Policy",
      description: "No smoking inside the property",
      status: "prohibited"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Guest Capacity",
      description: "Maximum 6 guests allowed",
      status: "limited"
    }
  ];

  const highlights = [
    {
      icon: "🏖️",
      title: "Beach Access",
      description: "Private beach access within 5 minutes walk"
    },
    {
      icon: "🏊‍♂️", 
      title: "Swimming Pool",
      description: "Shared pool available 24/7"
    },
    {
      icon: "🚗",
      title: "Free Parking",
      description: "Complimentary parking space included"
    },
    {
      icon: "🎯",
      title: "Prime Location", 
      description: "Walking distance to restaurants and shops"
    },
    {
      icon: "🧹",
      title: "Housekeeping",
      description: "Weekly cleaning service included"
    },
    {
      icon: "📞",
      title: "24/7 Support",
      description: "Round-the-clock guest assistance"
    }
  ];

  const getStatusColor = (status: string) => {
    const statusColors = {
      required: "bg-blue-50 text-blue-700 border-blue-200",
      allowed: "bg-green-50 text-green-700 border-green-200",
      prohibited: "bg-red-50 text-red-700 border-red-200",
      limited: "bg-yellow-50 text-yellow-700 border-yellow-200"
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.required;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Property Information</h2>
          <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-6"></div>
        </div>

        {/* Check-in/Check-out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {checkInOutInfo.map((info, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {info.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.label}</h3>
                  <div className="text-xl font-bold text-gray-900 mb-1">{info.value}</div>
                  <div className="text-sm text-gray-600">{info.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Policies */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">House Rules & Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(policy.status)}`}>
                <div className="flex items-start gap-3">
                  {policy.icon}
                  <div>
                    <h4 className="font-medium mb-1">{policy.title}</h4>
                    <p className="text-sm opacity-90">{policy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Highlights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                <span className="text-2xl flex-shrink-0">{highlight.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{highlight.title}</h4>
                  <p className="text-sm text-gray-600">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to Know</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Government-issued ID required for check-in</li>
                  <li>• Security deposit may be required</li>
                  <li>• Property is professionally cleaned between stays</li>
                  <li>• Local tourism tax may apply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyInfo.displayName = 'PropertyInfo';

export default PropertyInfo;