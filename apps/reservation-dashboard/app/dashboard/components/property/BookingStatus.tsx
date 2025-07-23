// app/components/property/BookingStatus.tsx
import { LoadingSpinner } from "../UI/LoadingSpinner";

interface BookingStatusProps {
  alreadyRequested: boolean;
  profileComplete: boolean | null;
  isCheckingProfile: boolean;
  error: string | null;
  debugInfo: string;
}

export default function BookingStatus({
  alreadyRequested,
  profileComplete,
  isCheckingProfile,
  error,
  debugInfo
}: BookingStatusProps) {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center">
        {alreadyRequested ? (
          <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
        ) : (
          <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
        )}
        <span className="text-gray-600">
          {alreadyRequested ? "Already Requested" : "Ready to Request"}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        {alreadyRequested 
          ? "You have already submitted a booking request for this property."
          : "Your booking request will be sent to the property owner for approval."
        }
        {profileComplete === false && !alreadyRequested && " Please complete your profile before proceeding."}
      </p>
      
      {isCheckingProfile && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm flex items-center">
          <LoadingSpinner className="h-4 w-4 text-blue-600" />
          Checking profile status...
        </div>
      )}
      
      {profileComplete === false && !isCheckingProfile && !alreadyRequested && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          Please complete your profile information in the Profile tab before requesting a booking.
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700 text-xs font-mono">
          Debug: {debugInfo}
        </div>
      )}
    </div>
  );
}