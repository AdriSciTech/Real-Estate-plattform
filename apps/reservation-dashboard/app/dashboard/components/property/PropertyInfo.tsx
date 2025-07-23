// app/ReservationDashboard/dashboard/components/property/PropertyInfo.tsx
import { PropertyData } from "../../../types";

interface PropertyInfoProps {
  property: PropertyData;
  formatPrice: (price: string) => string;
}

export default function PropertyInfo({
  property,
  formatPrice,
}: PropertyInfoProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">
        Property Details
      </h3>
      <div className="space-y-3">
        <div className="flex gap-4">
          {property.rooms && (
            <div className="text-gray-600 flex items-center">
              <span className="bg-blue-50 p-1 rounded-full mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10 0a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1z" />
                </svg>
              </span>
              <span className="font-medium">{property.rooms}</span> Bedrooms
            </div>
          )}
          {property.bathrooms && (
            <div className="text-gray-600 flex items-center">
              <span className="bg-blue-50 p-1 rounded-full mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </span>
              <span className="font-medium">{property.bathrooms}</span>{" "}
              Bathrooms
            </div>
          )}
        </div>
        {property.size && (
          <div className="text-gray-600 flex items-center">
            <span className="bg-blue-50 p-1 rounded-full mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </span>
            Size: <span className="font-medium">{property.size}</span>
          </div>
        )}
        <div className="text-blue-600 font-semibold text-xl mt-3 pt-3 border-t border-gray-100">
          {property.displayPrice || formatPrice(property.price)}
          {property.priceFrequency && (
            <span className="text-sm text-gray-500 ml-1">
              per {property.priceFrequency}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}