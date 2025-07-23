// my-app\components\PropertyForm\components\BasicInfoSection.tsx
import React from 'react';
import { PropertyFormData, PropertyType, TenantType, PrepaymentOption, PROPERTY_TYPES_ARRAY, TENANT_TYPES, PREPAYMENT_OPTIONS, PREPAYMENT_LABELS } from '@/lib/types';

interface BasicInfoSectionProps {
  formData: PropertyFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  onChange
}) => {
  return (
    <div className="space-y-8">
      {/* Basic Property Information */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Basic Property Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Beautiful downtown apartment"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main St"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (€) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500000"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type *
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROPERTY_TYPES_ARRAY.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Beds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
            </label>
            <input
              type="number"
              name="beds"
              required
              min="0"
              value={formData.beds}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>

          {/* Baths */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms *
            </label>
            <input
              type="number"
              name="baths"
              required
              min="0"
              step="0.5"
              value={formData.baths}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
            />
          </div>

          {/* Max Occupancy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Occupancy
            </label>
            <input
              type="number"
              name="max_occupancy"
              min="1"
              value={formData.max_occupancy}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="4"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the property features, amenities, and highlights..."
            />
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Property Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Floor Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Number
            </label>
            <input
              type="number"
              name="floor_number"
              value={formData.floor_number}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>

          {/* Has Elevator */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Elevator Available
            </label>
            <select
              name="has_elevator"
              value={formData.has_elevator}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Furnished */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Furnished
            </label>
            <select
              name="furnished"
              value={formData.furnished}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Parking Included */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Included
            </label>
            <select
              name="parking_included"
              value={formData.parking_included}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Parking Spaces */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Spaces
            </label>
            <input
              type="number"
              name="parking_spaces"
              min="0"
              value={formData.parking_spaces}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>

          {/* Available From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From
            </label>
            <input
              type="date"
              name="available_from"
              value={formData.available_from}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rental Terms */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Rental Terms & Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Renewable Contract */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renewable Contract
            </label>
            <select
              name="renewable_contract"
              value={formData.renewable_contract}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Preferred Tenant Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Tenant Type
            </label>
            <select
              name="preferred_tenant_type"
              value={formData.preferred_tenant_type}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              {TENANT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Utilities Included */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utilities Included
            </label>
            <select
              name="utilities_included"
              value={formData.utilities_included}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Prepayment Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prepayment Option
            </label>
            <select
              name="prepayment_option"
              value={formData.prepayment_option}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              {PREPAYMENT_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {PREPAYMENT_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          {/* Prepayment Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prepayment Price (€)
            </label>
            <input
              type="number"
              name="prepayment_price"
              min="0"
              step="0.01"
              value={formData.prepayment_price}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>

          {/* Instant Booking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Type
            </label>
            <select
              name="instant_booking"
              value={formData.instant_booking}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Instant Booking</option>
              <option value="false">Landlord Approval Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Rules & Amenities */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Property Rules & Amenities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Smoking Allowed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Smoking Allowed
            </label>
            <select
              name="smoking_allowed"
              value={formData.smoking_allowed}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Pets Allowed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pets Allowed
            </label>
            <select
              name="pets_allowed"
              value={formData.pets_allowed}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Property Visits Available */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Visits Available
            </label>
            <select
              name="property_visits_available"
              value={formData.property_visits_available}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select option</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          {/* Features & Amenities */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features & Amenities
            </label>
            <textarea
              name="features_amenities"
              rows={3}
              value={formData.features_amenities}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Air conditioning, Swimming pool, Gym, Balcony, etc. (separate with commas)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple amenities with commas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};