// components/PropertyAmenities.tsx
'use client';
import React, { memo, useMemo } from 'react';
import { Property } from '@rental/types';

interface PropertyAmenitiesProps {
  property: Property;
}

interface AmenityItem {
  icon: string;
  name: string;
  available: boolean;
  premium?: boolean;
}

interface AmenityCategory {
  title: string;
  items: AmenityItem[];
  color: string;
}

const PropertyAmenities = memo(({ property }: PropertyAmenitiesProps) => {
  const amenitiesData = useMemo((): AmenityCategory[] => [
    {
      title: "Essential Amenities",
      color: "blue",
      items: [
        { icon: "📶", name: "High-Speed WiFi", available: true, premium: true },
        { icon: "❄️", name: "Air Conditioning", available: true },
        { icon: "🔥", name: "Heating", available: true },
        { icon: "🚿", name: "Hot Water", available: true },
        { icon: "🧺", name: "Washing Machine", available: true },
        { icon: "👔", name: "Iron & Board", available: true },
        { icon: "🧴", name: "Toiletries", available: true },
        { icon: "🧻", name: "Linens & Towels", available: true }
      ]
    },
    {
      title: "Kitchen & Dining",
      color: "green", 
      items: [
        { icon: "❄️", name: "Full Refrigerator", available: true },
        { icon: "🔥", name: "Stove & Oven", available: true },
        { icon: "📱", name: "Microwave", available: true },
        { icon: "☕", name: "Coffee Machine", available: true, premium: true },
        { icon: "🍽️", name: "Dishware & Utensils", available: true },
        { icon: "🧽", name: "Dishwasher", available: true },
        { icon: "🥤", name: "Water Filter", available: true },
        { icon: "🍷", name: "Wine Glasses", available: true }
      ]
    },
    {
      title: "Entertainment & Comfort",
      color: "purple",
      items: [
        { icon: "📺", name: "Smart TV", available: true, premium: true },
        { icon: "🎵", name: "Sound System", available: true },
        { icon: "🎮", name: "Gaming Console", available: false },
        { icon: "📚", name: "Books & Magazines", available: true },
        { icon: "🛋️", name: "Comfortable Seating", available: true },
        { icon: "🌡️", name: "Climate Control", available: true },
        { icon: "🔌", name: "USB Charging Ports", available: true },
        { icon: "💡", name: "Ambient Lighting", available: true }
      ]
    },
    {
      title: "Safety & Security",
      color: "red",
      items: [
        { icon: "🔒", name: "Secure Entry", available: true },
        { icon: "📹", name: "Security Cameras", available: true },
        { icon: "🚨", name: "Smoke Detector", available: true },
        { icon: "🧯", name: "Fire Extinguisher", available: true },
        { icon: "🏥", name: "First Aid Kit", available: true },
        { icon: "🔑", name: "Safe Box", available: true },
        { icon: "🚪", name: "Keyless Entry", available: true, premium: true },
        { icon: "💡", name: "Emergency Lighting", available: true }
      ]
    }
  ], []);

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200", 
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      red: "bg-red-50 text-red-700 border-red-200"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Amenities & Features</h2>
          <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 ml-6"></div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {amenitiesData.map((category) => {
            const availableCount = category.items.filter(item => item.available).length;
            return (
              <div key={category.title} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{availableCount}</div>
                <div className="text-xs text-gray-600 font-medium">{category.title}</div>
              </div>
            );
          })}
        </div>

        {/* Amenities Grid */}
        <div className="space-y-8">
          {amenitiesData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getColorClasses(category.color)}`}>
                {category.title}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`relative flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
                      item.available 
                        ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm' 
                        : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        item.available ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {item.name}
                      </div>
                      {item.premium && item.available && (
                        <div className="text-xs text-blue-600 font-medium">Premium</div>
                      )}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.available ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    
                    {!item.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-gray-300"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fully Equipped Property</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This property comes fully equipped with modern amenities and premium features to ensure your comfort and convenience during your stay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyAmenities.displayName = 'PropertyAmenities';

export default PropertyAmenities;