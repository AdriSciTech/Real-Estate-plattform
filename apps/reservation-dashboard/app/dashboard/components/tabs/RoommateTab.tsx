// app/dashboard/components/tabs/RoommateTab.tsx
"use client";

export default function RoommateTab() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center py-16">
        <div className="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-100 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Roommate Matching</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Our roommate matching feature is coming soon! Find compatible roommates based on lifestyle, preferences, and schedules.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
          <h3 className="font-medium text-blue-800 mb-2">Get notified when we launch!</h3>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}