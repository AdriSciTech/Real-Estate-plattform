// hooks/useLandlordBookings.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { BookingRequest } from "../types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type TabType = "all" | "pending" | "approved" | "rejected";

// Get the current landlord's email from localStorage or session
const getLandlordEmail = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check if you store the email in localStorage
    const email = localStorage.getItem('landlordEmail');
    return email;
  }
  return null;
};

export function useLandlordBookings(router: AppRouterInstance) {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [ownedPropertyIds, setOwnedPropertyIds] = useState<string[]>([]);

  // First fetch the landlord's properties
  const fetchLandlordProperties = useCallback(async (): Promise<string[]> => {
    try {
      const landlordEmail = getLandlordEmail();
      
      if (!landlordEmail) {
        console.warn("No landlord email found in session");
        return [];
      }
      
      // Find the owner record by email
      const { data: ownerData, error } = await supabase
        .from('property_owners')
        .select('properties')
        .eq('email', landlordEmail)
        .single();
      
      if (error || !ownerData) {
        console.warn("No property owner found with email:", landlordEmail);
        return [];
      }
      
      // Return the property IDs owned by this landlord
      return ownerData.properties || [];
      
    } catch (err) {
      console.error("Error fetching landlord properties:", err);
      return [];
    }
  }, []);

  const fetchBookingRequests = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      // First get the properties owned by this landlord
      const propertyIds = await fetchLandlordProperties();
      setOwnedPropertyIds(propertyIds);
      
      if (propertyIds.length === 0) {
        // If landlord has no properties, return empty array
        setBookingRequests([]);
        setLoading(false);
        return;
      }
      
      // Get booking requests for the landlord's properties
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('booking_requests')
        .select(`
          *,
          properties (
            id,
            title,
            images,
            price,
            price_frequency
          ),
          user_profiles (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .in('property_id', propertyIds)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        throw bookingsError;
      }

      const requests: BookingRequest[] = bookingsData?.map((booking) => {
        // Handle date conversion
        let requestDate: Date;
        try {
          requestDate = booking.created_at ? new Date(booking.created_at) : new Date();
        } catch (_error) {
          requestDate = new Date();
        }

        // Get property and user details
        const property = booking.properties;
        const userProfile = booking.user_profiles;

        return {
          id: booking.id,
          propertyId: booking.property_id || "",
          propertyTitle: property?.title || "Unnamed Property",
          propertyImage: property?.images?.[0] || "",
          price: property?.price?.toString() || "",
          priceFrequency: property?.price_frequency || null,
          requestDate,
          status: (booking.status as "pending" | "approved" | "rejected") || "pending",
          userName: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || "Unknown" : "Unknown",
          userEmail: userProfile?.email || "",
          userPhone: userProfile?.phone || "",
          userId: booking.user_id || "Unknown",
          ownerEmail: booking.owner_email || ""
        };
      }) || [];

      setBookingRequests(requests);
      setError(null);
    } catch (err: unknown) {
      console.error("Error fetching booking requests:", err);
      setError(`Failed to load booking requests: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [fetchLandlordProperties]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchBookingRequests();
  }, [fetchBookingRequests]);

  const handleLogout = useCallback((): void => {
    localStorage.removeItem("landlordLoggedIn");
    localStorage.removeItem("landlordEmail");
    router.push("/landlord/login");
  }, [router]);

  const navigateToTenantDetails = useCallback((requestId: string): void => {
    router.push(`/landlord/tenant/${requestId}`);
  }, [router]);

  // Filter requests based on active tab
  const filteredRequests = bookingRequests.filter(request => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  return {
    bookingRequests,
    filteredRequests,
    loading,
    error,
    activeTab,
    setActiveTab,
    fetchBookingRequests,
    handleLogout,
    navigateToTenantDetails,
    ownedPropertyIds
  };
}