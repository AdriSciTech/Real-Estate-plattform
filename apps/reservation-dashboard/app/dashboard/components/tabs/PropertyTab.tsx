//listings-plattform\app\ReservationDashboard\dashboard\components\tabs\PropertyTab.tsx

"use client";

import { useRouter } from "next/navigation";
import { PropertyData } from "../../../types";
import PropertyDetails from "../property/PropertyDetails";
import PropertyGallery from "../property/PropertyGallery";
import NoProperty from "../NoProperty";

interface PropertyTabProps {
  property: PropertyData | null;
  formatPrice: (price: string) => string;
  onReserve: () => void;
}

export default function PropertyTab({
  property,
  formatPrice,
  onReserve,
}: PropertyTabProps) {
  const router = useRouter();

  if (!property) {
    return <NoProperty />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {property.featuredImage && (
        <div className="relative w-full h-64">
          <img
            src={property.featuredImage}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{property.title}</h2>

        <PropertyDetails property={property} formatPrice={formatPrice} />

        <PropertyGallery images={property.galleryImages || []} />
      </div>
    </div>
  );
}
