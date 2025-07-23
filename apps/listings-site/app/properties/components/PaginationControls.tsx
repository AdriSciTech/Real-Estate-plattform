// app/properties/components/PaginationControls.tsx - Professional Mobile-First Implementation
"use client";

import { useMemo } from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  searchParams: {
    saleOrRent?: string;
    location?: string;
    city?: string;
    beds?: string;
    baths?: string;
    priceRange?: string;
    propertyId?: string;
    propertyType?: string;
    page?: string;
    view?: 'list' | 'map';
    sort?: 'newest' | 'price-low' | 'price-high' | 'beds' | 'baths';
    mobile?: 'true' | 'false';
  };
  isMobile?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  searchParams,
  isMobile = false
}: PaginationControlsProps) {
  // Build URL for pagination
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Preserve all search parameters except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value);
      }
    });
    
    if (page > 1) {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    return `/properties${queryString ? `?${queryString}` : ''}`;
  };

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const delta = isMobile ? 1 : 2; // Show fewer pages on mobile
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always include last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add dots where there are gaps
    let prev = 0;
    for (const page of uniqueRange) {
      if (page - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  }, [currentPage, totalPages, isMobile]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center" aria-label="Pagination">
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <a
            href={buildPageUrl(currentPage - 1)}
            className="inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {!isMobile && <span className="ml-1">Previous</span>}
          </a>
        ) : (
          <span className="inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {!isMobile && <span className="ml-1">Previous</span>}
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-2 py-2 text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              );
            }

            const page = pageNum as number;
            const isCurrentPage = page === currentPage;

            return (
              <a
                key={page}
                href={buildPageUrl(page)}
                className={`
                  inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium border rounded-md transition-colors
                  ${isCurrentPage
                    ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </a>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <a
            href={buildPageUrl(currentPage + 1)}
            className="inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            aria-label="Next page"
          >
            {!isMobile && <span className="mr-1">Next</span>}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ) : (
          <span className="inline-flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
            {!isMobile && <span className="mr-1">Next</span>}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>

      {/* Page Info - Mobile Only */}
      {isMobile && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}
    </nav>
  );
}