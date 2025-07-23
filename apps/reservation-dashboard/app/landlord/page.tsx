"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import DashboardHeader from "../../components/landlord/DashboardHeader"; // Component not found - commented out
// import TabNavigation from "../../components/landlord/TabNavigation"; // Component not found
// import BookingTable from "../../components/landlord/BookingTable"; // Component not found
// import EmptyState from "../../components/UI/EmptyState"; // Component not found
// import ErrorAlert from "../../components/UI/ErrorAlert"; // Component not found
import { LoadingSpinner } from "../dashboard/components/UI/LoadingSpinner"; // Updated path and import
import { useLandlordBookings } from "../../hooks/useLandlordBookings";

export default function LandlordDashboard() {
  const router = useRouter();
  const {
    bookingRequests,
    filteredRequests,
    loading,
    error,
    activeTab,
    setActiveTab,
    fetchBookingRequests,
    handleLogout,
    navigateToTenantDetails,
  } = useLandlordBookings(router);

  useEffect(() => {
    // Check if landlord is logged in
    const isLoggedIn = localStorage.getItem("landlordLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/landlord/login");
      return;
    }

    fetchBookingRequests();
  }, [router, fetchBookingRequests]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <DashboardHeader title="Landlord Dashboard" onLogout={handleLogout} /> */}
      {/* TODO: Replace with existing DashboardHeader component or create new one */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* TODO: Replace with actual components */}
        <div className="mt-4">
          <p className="text-gray-600">Components are being migrated. Placeholder UI shown.</p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {activeTab === "all"
                  ? "There are no booking requests yet."
                  : `There are no ${activeTab} booking requests.`}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg mt-4">
              <div className="p-4">
                <p className="text-gray-600">Booking requests: {filteredRequests.length}</p>
                {/* Placeholder for BookingTable */}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
