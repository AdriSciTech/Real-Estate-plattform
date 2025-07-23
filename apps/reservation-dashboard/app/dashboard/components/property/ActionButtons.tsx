// app/components/property/ActionButtons.tsx
import { LoadingSpinner } from "../UI/LoadingSpinner";
import { PropertyData } from "../../../types";
import { ExternalLink, Home } from "lucide-react";

interface ActionButtonsProps {
  property: PropertyData;
  isSubmitting: boolean;
  isCheckingProfile: boolean;
  profileComplete: boolean | null;
  alreadyRequested: boolean;
  handleRequestBooking: () => Promise<void>;
  goToListingWebsite: () => void;
}

export default function ActionButtons({
  property,
  isSubmitting,
  isCheckingProfile,
  profileComplete,
  alreadyRequested,
  handleRequestBooking,
  goToListingWebsite,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
      <button
        onClick={handleRequestBooking}
        disabled={
          isSubmitting ||
          isCheckingProfile ||
          profileComplete === false ||
          alreadyRequested
        }
        className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-70 flex items-center justify-center font-medium w-full sm:w-auto"
        type="button"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner />
            <span className="ml-2">Processing...</span>
          </>
        ) : alreadyRequested ? (
          "Already Requested"
        ) : (
          "Request Booking"
        )}
      </button>
      
      <button
        onClick={goToListingWebsite}
        className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium flex items-center justify-center w-full sm:w-auto"
        type="button"
      >
        <span>Find Another Apartment</span>
      </button>
      
      {property.url && (
        <a
          href={property.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border border-teal-600 text-teal-600 rounded-md hover:bg-gray-50 transition-colors text-center font-medium flex items-center justify-center w-full sm:w-auto"
        >
          <span>View Original Listing</span>
          <ExternalLink className="ml-2 w-4 h-4" />
        </a>
      )}
    </div>
  );
}