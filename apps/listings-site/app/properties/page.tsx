//listings-plattform\app\properties\page.tsx
import { createServerClient } from '@rental/supabase';
import { Property, validateProperty, PropertyValidationResult } from '@rental/types';
import PropertySearch from "@/apps/listings-site/app/home/components/PropertySearch";
import ViewToggle from "./components/ViewToggle";
import PropertiesContent from "./components/PropertiesContent";

// Note: Image optimization is now handled client-side with CDN transformations
// No server-side processing needed

interface PropertiesPageProps {
  searchParams: Promise<{
    saleOrRent?: string;
    location?: string;
    city?: string;
    beds?: string;
    baths?: string;
    priceRange?: string;
    propertyId?: string;
    propertyType?: string;
    page?: string;
    view?: "list" | "map";
  }>;
}

// Server-side data fetching function
async function fetchProperties(
  searchParams: Awaited<PropertiesPageProps["searchParams"]>
) {
  const PROPERTIES_PER_PAGE = 12;
  const currentPage = parseInt(searchParams.page || "1");

  try {
    // Try to fetch from Supabase first
    const supabase = createServerClient();

    if (!supabase) {
      throw new Error(
        "Supabase client not available - check environment variables"
      );
    }

    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Query setup complete

    // Apply filters based on search parameters
    if (searchParams.propertyType) {
      query = query.eq("type", searchParams.propertyType);
    }

    if (searchParams.location) {
      query = query.or(
        `address.ilike.%${searchParams.location}%,description.ilike.%${searchParams.location}%`
      );
    }

    if (searchParams.city) {
      query = query.ilike("address", `%${searchParams.city}%`);
    }

    // Note: Using actual column names from the database
    // The database might have different column names than expected
    // TODO: Ensure database has the correct columns
    
    // For now, comment out these filters until we confirm column names
    // if (searchParams.beds) {
    //   const bedsNum = parseInt(searchParams.beds);
    //   if (!isNaN(bedsNum) && bedsNum > 0) {
    //     query = query.gte("rooms", bedsNum);
    //   }
    // }

    // if (searchParams.baths) {
    //   const bathsNum = parseInt(searchParams.baths);
    //   if (!isNaN(bathsNum) && bathsNum > 0) {
    //     query = query.gte("bathrooms", bathsNum);
    //   }
    // }

    if (searchParams.priceRange && searchParams.priceRange.includes("-")) {
      const [minPriceStr, maxPriceStr] = searchParams.priceRange.split("-");
      const minPrice = parseInt(minPriceStr);
      const maxPrice = parseInt(maxPriceStr);

      if (!isNaN(minPrice) && minPrice > 0) {
        query = query.gte("price", minPrice);
      }
      if (!isNaN(maxPrice) && maxPrice < 9999999) {
        query = query.lte("price", maxPrice);
      }
    }

    if (searchParams.propertyId) {
      query = query.eq("id", searchParams.propertyId);
    }

    // For map view, fetch all properties (no pagination) to show on map
    // For list view, apply pagination
    const isMapView = searchParams.view === "map";

    if (!isMapView) {
      const { data, error, count } = await query.range(
        (currentPage - 1) * PROPERTIES_PER_PAGE,
        currentPage * PROPERTIES_PER_PAGE - 1
      );

      if (error) {
        console.error('Supabase query error:', error);
        console.error('Query details:', { searchParams });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from database");
      }

      // Validate properties
      const validatedProperties: Property[] = [];

      for (const item of data) {
        const validatedResult = validateProperty(item);
        if (validatedResult.isValid && validatedResult.property) {
          validatedProperties.push(validatedResult.property);
        }
      }

      return {
        properties: validatedProperties,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / PROPERTIES_PER_PAGE),
        currentPage,
        isFromSupabase: true,
      };
    } else {
      // For map view, get all matching properties
      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        console.error('Query details:', { searchParams });
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned from database");
      }

      // Validate properties
      const validatedProperties: Property[] = [];

      for (const item of data) {
        const validatedResult = validateProperty(item);
        if (validatedResult.isValid && validatedResult.property) {
          validatedProperties.push(validatedResult.property);
        }
      }

      return {
        properties: validatedProperties,
        totalCount: count || 0,
        totalPages: 1, // No pagination for map view
        currentPage: 1,
        isFromSupabase: true,
      };
    }
  } catch (error) {
    console.error("Failed to fetch properties from Supabase:", error);

    // Fallback: try to use API route
    try {
      const apiUrl = new URL('/api/properties', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      const response = await fetch(apiUrl.toString());
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.properties) {
          return {
            properties: data.properties,
            totalCount: data.total || 0,
            totalPages: Math.ceil((data.total || 0) / PROPERTIES_PER_PAGE),
            currentPage,
            isFromSupabase: false,
          };
        }
      }
    } catch (apiError) {
      console.error("API fallback also failed:", apiError);
    }

    // Return empty results if everything fails
    return {
      properties: [],
      totalCount: 0,
      totalPages: 0,
      currentPage,
      isFromSupabase: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to connect to database",
    };
  }
}

// Helper function to count active filters
function getActiveFiltersCount(
  searchParams: Awaited<PropertiesPageProps["searchParams"]>
): number {
  let count = 0;
  const params = [
    "saleOrRent",
    "location",
    "city",
    "beds",
    "baths",
    "priceRange",
    "propertyId",
    "propertyType",
  ];
  params.forEach((param) => {
    if (searchParams[param as keyof typeof searchParams]) count++;
  });
  return count;
}

// Properties Content Component (Client Component for Map Interaction)
// This will be moved to a separate file: app/properties/components/PropertiesContent.tsx

// Main Server Component
export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  try {
    // Await the searchParams Promise
    const resolvedSearchParams = await searchParams;

    const {
      properties,
      totalCount,
      totalPages,
      currentPage,
      isFromSupabase,
      error,
    } = await fetchProperties(resolvedSearchParams);
    const activeFiltersCount = getActiveFiltersCount(resolvedSearchParams);
    const currentView = resolvedSearchParams.view || "list";

    // Show error if Supabase connection failed
    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md mx-auto text-center p-6">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Database Connection Error
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              {error}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your Supabase configuration and try again.
            </p>
            <a
              href="/properties"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-block text-sm font-medium"
            >
              Retry
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Header - Mobile Optimized */}
        <div className="bg-white shadow-sm border-b">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  Properties
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {totalCount} {totalCount === 1 ? "property" : "properties"}{" "}
                  found
                </p>
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex-shrink-0">
                  <a
                    href="/properties"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
                  >
                    <span className="truncate">Clear All Filters</span>
                    <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0">
                      {activeFiltersCount}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Section - Mobile Optimized */}
        <div className="bg-white border-b">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="w-full overflow-hidden">
              <PropertySearch />
            </div>
          </div>
        </div>

        {/* View Toggle Section - Mobile Optimized */}
        <div className="bg-white border-b">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <ViewToggle
                  currentView={currentView}
                  searchParams={resolvedSearchParams}
                  totalCount={totalCount}
                />
              </div>

              {/* Results count for current view - Mobile Optimized */}
              <div className="text-xs sm:text-sm text-gray-600 text-right sm:text-left order-first sm:order-last">
                {currentView === "list" && totalPages > 1 ? (
                  <span className="block sm:inline">
                    Showing {(currentPage - 1) * 12 + 1} to{" "}
                    {Math.min(currentPage * 12, totalCount)} of {totalCount}
                  </span>
                ) : (
                  <span className="block sm:inline">
                    Showing {properties.length}{" "}
                    {properties.length === 1 ? "property" : "properties"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - Mobile Optimized */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {properties.length === 0 ? (
            /* Empty State - Mobile Optimized */
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-4xl sm:text-6xl mb-4">🏠</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                {activeFiltersCount > 0
                  ? "Try adjusting your search criteria to see more results."
                  : "No properties are currently available. Please check back later."}
              </p>
              {activeFiltersCount > 0 ? (
                <a
                  href="/properties"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-block text-sm font-medium"
                >
                  View All Properties
                </a>
              ) : (
                <a
                  href="/properties"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-block text-sm font-medium"
                >
                  Refresh
                </a>
              )}
            </div>
          ) : (
            /* Properties Content - Mobile Optimized Container */
            <div className="w-full overflow-hidden">
              <PropertiesContent
                properties={properties}
                currentView={currentView}
                currentPage={currentPage}
                totalPages={totalPages}
                resolvedSearchParams={resolvedSearchParams}
              />
            </div>
          )}
        </div>

        {/* Mobile-specific bottom spacing for better UX */}
        <div className="h-4 sm:h-0" />
      </div>
    );
  } catch (error) {
    console.error("Error in PropertiesPage:", error);

    // Fallback error boundary - Mobile Optimized
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto text-center p-6">
          <div className="text-4xl sm:text-6xl mb-4">⚠️</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            An unexpected error occurred while loading the properties page.
          </p>
          <a
            href="/properties"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-block text-sm font-medium"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }
}
