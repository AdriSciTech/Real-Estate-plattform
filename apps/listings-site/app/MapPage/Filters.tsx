// app/map/Filters.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { PropertyType } from '@rental/types'
import { RotateCcw } from 'lucide-react'

interface SearchParams {
  location?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  beds?: string
  baths?: string
}

interface PropertyFiltersProps {
  searchParams: SearchParams
}

export default function PropertyFilters({ searchParams }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<SearchParams>({})

  const propertyTypes: PropertyType[] = ['Apartment', 'House', 'Condo', 'Townhouse', 'Villa']

  // Memoize searchParams to prevent infinite loops
  const memoizedSearchParams = useMemo(() => searchParams, [
    searchParams.location,
    searchParams.type, 
    searchParams.minPrice,
    searchParams.maxPrice,
    searchParams.beds,
    searchParams.baths
  ])

  // Update local state only when memoized searchParams actually change
  useEffect(() => {
    setFilters(memoizedSearchParams)
  }, [memoizedSearchParams])

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      }
    })
    
    const queryString = params.toString()
    const newUrl = queryString ? `/map?${queryString}` : '/map'
    const currentUrl = window.location.pathname + window.location.search
    
    // Only update URL if it would actually change
    if (newUrl !== currentUrl) {
      // Use History API instead of router to avoid navigation
      window.history.replaceState({}, '', newUrl)
    }
  }, [filters])

  const clearFilters = () => {
    setFilters({})
    // Use History API instead of router
    window.history.replaceState({}, '', '/map')
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '')

  // Apply filters with debounce - only when user actually changes filters
  useEffect(() => {
    // Skip if filters haven't actually changed from URL
    const filtersMatch = Object.keys({...memoizedSearchParams, ...filters}).every(
      key => memoizedSearchParams[key as keyof SearchParams] === filters[key as keyof SearchParams]
    )
    
    if (filtersMatch) return

    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [filters, applyFilters, memoizedSearchParams])

  return (
    <div className="space-y-6">
      {/* Header with clear button */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          placeholder="City, neighborhood, or address"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.location || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.type || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="">All Types</option>
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min Price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.minPrice || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.maxPrice || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bedrooms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Any', '1+', '2+', '3+', '4+', '5+'].map((option, index) => (
            <button
              key={option}
              onClick={() => setFilters(prev => ({ ...prev, beds: index === 0 ? '' : index.toString() }))}
              className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                (filters.beds === index.toString() || (index === 0 && !filters.beds))
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bathrooms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Any', '1+', '2+', '3+', '4+'].map((option, index) => (
            <button
              key={option}
              onClick={() => setFilters(prev => ({ ...prev, baths: index === 0 ? '' : index.toString() }))}
              className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                (filters.baths === index.toString() || (index === 0 && !filters.baths))
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.location && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.location}
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.type}
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                €{filters.minPrice || '0'} - €{filters.maxPrice || '∞'}
              </span>
            )}
            {filters.beds && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.beds}+ beds
              </span>
            )}
            {filters.baths && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.baths}+ baths
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
