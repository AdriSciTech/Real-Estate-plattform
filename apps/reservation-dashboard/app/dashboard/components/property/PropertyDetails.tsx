// app/components/property/PropertyDetails.tsx
"use client";

import { useEffect } from "react";
import PropertyInfo from "./PropertyInfo";
import BookingStatus from "./BookingStatus";
import BookingSuccess from "./BookingSuccess";
import ActionButtons from "./ActionButtons";
import { usePropertyBooking } from "../../../../hooks/usePropertyBooking";
import { PropertyData } from "../../../../types";

interface PropertyDetailsProps {
  property: PropertyData;
  formatPrice: (price: string) => string;
}

export default function PropertyDetails({
  property,
  formatPrice,
}: PropertyDetailsProps) {
  const {
    isSubmitting,
    error,
    profileComplete,
    isCheckingProfile,
    debugInfo,
    emailPreviewUrl,
    bookingSuccess,
    alreadyRequested,
    handleRequestBooking,
    goToListingWebsite,
    viewBookings,
  } = usePropertyBooking(property);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {bookingSuccess ? (
        <BookingSuccess
          emailPreviewUrl={emailPreviewUrl}
          viewBookings={viewBookings}
          goToListingWebsite={goToListingWebsite}
        />
      ) : (
        <>
          <PropertyInfo property={property} formatPrice={formatPrice} />

          <div>
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">
              Booking Status
            </h3>

            <BookingStatus
              alreadyRequested={alreadyRequested}
              profileComplete={profileComplete}
              isCheckingProfile={isCheckingProfile}
              error={error}
              debugInfo={debugInfo}
            />

            <ActionButtons
              property={property}
              isSubmitting={isSubmitting}
              isCheckingProfile={isCheckingProfile}
              profileComplete={profileComplete}
              alreadyRequested={alreadyRequested}
              handleRequestBooking={handleRequestBooking}
              goToListingWebsite={goToListingWebsite}
            />
          </div>
        </>
      )}
    </div>
  );
}
