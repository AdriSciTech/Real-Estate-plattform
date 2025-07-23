// app/components/property/BookingSuccess.tsx
interface BookingSuccessProps {
    emailPreviewUrl: string | null;
    viewBookings: () => void;
    goToListingWebsite: () => void;
  }
  
  export default function BookingSuccess({ 
    emailPreviewUrl, 
    viewBookings, 
    goToListingWebsite 
  }: BookingSuccessProps) {
    return (
      <div className="col-span-1 md:col-span-2 bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="text-center mb-4">
          <div className="inline-block p-2 bg-green-100 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Booking Request Submitted!</h3>
          <p className="text-green-700 mb-4">
            Your booking request has been successfully submitted. The property owner will be notified.
          </p>
        </div>
        
        {emailPreviewUrl && (
          <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">
              During testing, you can see what the email to the property owner looks like:
            </p>
            <a 
              href={emailPreviewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View Email Preview
            </a>
            <p className="text-xs text-gray-500 mt-1">
              (This is a testing feature using Ethereal Email and will be removed in production)
            </p>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={viewBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Booking Requests
          </button>
          <button
            onClick={goToListingWebsite}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Find Another Property
          </button>
        </div>
      </div>
    );
  }