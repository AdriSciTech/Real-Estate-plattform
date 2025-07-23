// app/properties/components/ViewToggle.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ViewToggleProps {
  currentView: 'list' | 'map';
  searchParams: Record<string, string>;
  totalCount: number;
}

export default function ViewToggle({ currentView, searchParams, totalCount }: ViewToggleProps) {
  // Create URL search params for links
  const createViewUrl = (view: 'list' | 'map') => {
    const params = new URLSearchParams();
    
    // Add all existing search parameters except 'view' and 'page'
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'view' && key !== 'page' && value) {
        params.set(key, value);
      }
    });
    
    // Add the new view parameter
    if (view !== 'list') {
      params.set('view', view);
    }
    
    const queryString = params.toString();
    return `/properties${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="flex items-center gap-4">
      {/* View Toggle Buttons */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <Link
          href={createViewUrl('list')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${currentView === 'list'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          List
        </Link>
        
        <Link
          href={createViewUrl('map')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${currentView === 'map'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Map
        </Link>
      </div>

      {/* Sort Options - only show for list view */}
      {currentView === 'list' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select 
            className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            defaultValue="newest"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="beds">Most Bedrooms</option>
            <option value="baths">Most Bathrooms</option>
          </select>
        </div>
      )}

      {/* Save Search Button */}
      {totalCount > 0 && (
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Save Search
        </button>
      )}
    </div>
  );
}