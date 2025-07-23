"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase, auth } from "../../../../lib/supabase";
import { PropertyData, BookingRequest } from "../../../types";

interface ReservedPropertyProps {
  formatPrice: (price: string) => string;
}

export default function ReservedProperty({
  formatPrice,
}: ReservedPropertyProps) {
  const [reservedProperty, setReservedProperty] = useState<PropertyData | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [authState, setAuthState] = useState<string>("checking");

  // Fetch reserved property from Firebase when component mounts
  useEffect(() => {
    const fetchReservedProperty = async () => {
      setLoading(true);
      setError(null);
      console.log("Starting to fetch reserved property...");
  
      try {
        // Wait for authentication to be ready
        setAuthState("waiting");
        const { data: { user } } = await auth.getSession();
        setAuthState(user ? "authenticated" : "unauthenticated");
        
        if (!user) {
          console.log("No authenticated user found");
          setError("You must be logged in to view your reserved properties");
          setLoading(false);
          return;
        }
  
        console.log("Current user ID:", user.id);
  
        // APPROACH 1: Check booking_requests first
        console.log("Querying for bookings with status 'reserved'");
        
        // Try looking for bookings with status "reserved" first
        let { data: reservedBookings, error: reservedError } = await supabase
          .from('booking_requests')
          .select(`
            *,
            properties (
              id,
              title,
              images,
              price,
              price_frequency,
              rooms,
              bathrooms,
              size
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'reserved');
        
        if (reservedError) {
          throw reservedError;
        }
  
        console.log(`Found ${reservedBookings?.length || 0} bookings with status 'reserved'`);
        
        // If no results in bookings, try alternative approaches
        if (!reservedBookings || reservedBookings.length === 0) {
          console.log("No bookings found with status 'reserved', trying alternative approaches");
          
          // APPROACH 2: Check if any properties are reserved by this user
          console.log("Checking properties collection for reservations");
          const { data: reservedProperties, error: propertiesError } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'reserved')
            .eq('reserved_by', user.id);
          
          if (propertiesError) {
            throw propertiesError;
          }
          
          console.log(`Found ${reservedProperties?.length || 0} properties reserved by this user`);
          
          if (reservedProperties && reservedProperties.length > 0) {
            // Found a reserved property in the properties collection
            const propertyData = reservedProperties[0];
            
            console.log("Found reserved property:", propertyData.id);
            
            // Check if we have a booking_id reference
            if (propertyData.booking_id) {
              setReservationId(propertyData.booking_id);
            }
            
            // Create property data from the property document
            const property: PropertyData = {
              id: propertyData.id,
              title: propertyData.title || "Unnamed Property",
              price: propertyData.price?.toString() || "",
              displayPrice: propertyData.display_price || "",
              priceFrequency: propertyData.price_frequency || null,
              featuredImage: propertyData.images?.[0] || "",
              image: propertyData.images?.[0] || "",
              galleryImages: propertyData.images || [],
              url: `/properties/${propertyData.id}`,
              rooms: propertyData.rooms?.toString() || "N/A",
              bathrooms: propertyData.bathrooms?.toString() || "N/A",
              size: propertyData.size || "N/A",
            };
            
            console.log("Created property object from properties collection:", property);
            setReservedProperty(property);
            setLoading(false);
            return;
          }
          
          // APPROACH 3: Try alternative booking status values
          console.log("No properties found, trying alternative booking status values");
          const alternativeStatuses = ["Reserved", "RESERVED", "completed", "confirmed"];
          
          for (const status of alternativeStatuses) {
            console.log(`Trying status: '${status}'`);
            const { data: altBookings, error: altError } = await supabase
              .from('booking_requests')
              .select(`
                *,
                properties (
                  id,
                  title,
                  images,
                  price,
                  price_frequency,
                  rooms,
                  bathrooms,
                  size
                )
              `)
              .eq('user_id', user.id)
              .eq('status', status);
            
            if (altError) {
              console.error(`Error querying for status '${status}':`, altError);
              continue;
            }
            
            console.log(`Found ${altBookings?.length || 0} bookings with status '${status}'`);
            if (altBookings && altBookings.length > 0) {
              console.log(`Using booking with status '${status}'`);
              reservedBookings = altBookings;
              break;
            }
          }
          
          // APPROACH 4: Try looking for bookings with completed payment
          if (!reservedBookings || reservedBookings.length === 0) {
            console.log("Trying query with payment_status");
            const { data: paymentBookings, error: paymentError } = await supabase
              .from('booking_requests')
              .select(`
                *,
                properties (
                  id,
                  title,
                  images,
                  price,
                  price_frequency,
                  rooms,
                  bathrooms,
                  size
                )
              `)
              .eq('user_id', user.id)
              .eq('payment_status', 'completed');
            
            if (paymentError) {
              console.error("Error querying payment status:", paymentError);
            } else {
              console.log(`Found ${paymentBookings?.length || 0} bookings with completed payment`);
              reservedBookings = paymentBookings;
            }
          }
        }
  
        // If still no bookings found, show debug info
        if (!reservedBookings || reservedBookings.length === 0) {
          console.log("No reserved bookings found after all approaches");
          
          // For debugging: let's fetch ALL bookings for this user to see what's there
          const { data: allBookings, error: allBookingsError } = await supabase
            .from('booking_requests')
            .select('*')
            .eq('user_id', user.id);
          
          if (allBookingsError) {
            console.error("Error fetching all bookings:", allBookingsError);
          } else if (allBookings && allBookings.length > 0) {
            console.log(`Found ${allBookings.length} bookings for this user with different statuses`);
            // Log all bookings for debugging
            allBookings.forEach((booking, index) => {
              console.log(`Booking ${index + 1} (${booking.id}):`);
              console.log(`- Status: ${booking.status}`);
              console.log(`- Payment Status: ${booking.payment_status}`);
              console.log(`- Property ID: ${booking.property_id}`);
            });
            
            setDebugInfo({
              message: `Found ${allBookings.length} bookings for user ${user.id}, but none with status 'reserved'`,
              bookings: allBookings.map(booking => ({
                id: booking.id,
                status: booking.status,
                paymentStatus: booking.payment_status,
                propertyId: booking.property_id
              }))
            });
          } else {
            console.log("No bookings found for this user at all");
            setDebugInfo({
              message: `No bookings found for user ${user.id}`,
              userInfo: {
                id: user.id,
                email: user.email
              }
            });
          }
          
          setLoading(false);
          return; // No reserved properties found
        }
  
        // Process booking data if found
        const bookingData = reservedBookings[0];
        
        console.log("Found booking:", bookingData.id);
        console.log("Booking data:", JSON.stringify(bookingData, null, 2));
        setReservationId(bookingData.id);
        
        // Get property information from the joined properties table
        const propertyData = bookingData.properties || {};
        console.log("Property data:", JSON.stringify(propertyData, null, 2));
  
        // Create property object using the joined property data
        if (propertyData && propertyData.id) {
          const property: PropertyData = {
            id: propertyData.id,
            title: propertyData.title || "Unnamed Property",
            price: propertyData.price?.toString() || "",
            displayPrice: propertyData.display_price || "",
            priceFrequency: propertyData.price_frequency || null,
            featuredImage: propertyData.images?.[0] || "",
            image: propertyData.images?.[0] || "",
            galleryImages: propertyData.images || [],
            url: `/properties/${propertyData.id}`,
            rooms: propertyData.rooms?.toString() || "N/A",
            bathrooms: propertyData.bathrooms?.toString() || "N/A",
            size: propertyData.size || "N/A",
          };
          
          console.log("Created property object from joined property data:", property);
          setReservedProperty(property);
          setLoading(false);
          return;
        }
  
        // Fallback: Create a PropertyData object from booking data
        const property: PropertyData = {
          id: bookingData.property_id || "",
          title: "Property Information Not Available",
          price: "",
          displayPrice: "",
          priceFrequency: null,
          featuredImage: "",
          image: "",
          galleryImages: [],
          url: `/properties/${bookingData.property_id}`,
          rooms: "N/A",
          bathrooms: "N/A",
          size: "N/A",
        };
        
        console.log("Created fallback property object from booking data:", JSON.stringify(property, null, 2));
        setReservedProperty(property);
      } catch (err) {
        console.error("Error fetching reserved property:", err);
        setError(`Failed to load reserved property: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchReservedProperty();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Reserved Property</h1>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your reserved property...</p>
          <p className="text-gray-500 text-sm mt-2">Auth state: {authState}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Reserved Property</h1>
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (debugInfo) {
    // Show debug information if available
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Reserved Property</h1>
        <div className="p-4 bg-yellow-50 rounded-lg mb-4">
          <h3 className="font-bold text-yellow-800 mb-2">Debug Information</h3>
          <p>{debugInfo.message}</p>
          <pre className="mt-2 text-xs overflow-auto max-h-60 bg-gray-100 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        <p className="text-gray-500 text-lg">No property currently reserved.</p>
        <div className="mt-6">
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!reservedProperty) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Reserved Property</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <p className="text-xl text-gray-700 mb-3">No property information available.</p>
          <p className="text-gray-500 mb-6">To reserve a property, click the "Reserve This Property" button on a property listing.</p>
          <Link href="/properties">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700 transition-colors">
              Browse Properties
            </button>
          </Link>
        </div>
      </div>
    );
  }

  async function confirmCancellation(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    if (!reservationId) return;

    setIsCancelling(true);

    try {
      // Update booking status to cancelled in Supabase
      const { error } = await supabase
        .from('booking_requests')
        .update({
          status: 'cancelled',
          cancelled_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId);

      if (error) {
        throw error;
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      setIsCancelling(false);
      setIsConfirmingCancel(false);
      setError("Failed to cancel reservation. Please try again.");
    }
  }

  function cancelCancellation(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setIsConfirmingCancel(false);
  }

  function handleCancelReservation(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setIsConfirmingCancel(true);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Reserved Property</h1>

      {isConfirmingCancel ? (
        <div className="mb-6 p-4 border rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold mb-3">Confirm Cancellation</h3>
          <p className="mb-4 text-gray-700">
            Are you sure you want to cancel your reservation for{" "}
            <strong>{reservedProperty.title}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={confirmCancellation}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Reservation"}
            </button>
            <button
              onClick={cancelCancellation}
              disabled={isCancelling}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              No, Keep Reservation
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Image */}
          <div className="overflow-hidden rounded-lg">
            <img 
              src={reservedProperty.featuredImage || reservedProperty.image} 
              alt={reservedProperty.title}
              className="w-full h-64 object-cover" 
            />
          </div>
          
          {/* Property Details */}
          <div>
            <h2 className="text-xl font-bold mb-3">{reservedProperty.title}</h2>
            
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">
              Property Details
            </h3>
            <div className="space-y-3 mb-4">
              <div className="text-gray-700">
                <strong>Bedrooms:</strong> {reservedProperty.rooms}
              </div>
              <div className="text-gray-700">
                <strong>Bathrooms:</strong> {reservedProperty.bathrooms}
              </div>
              <div className="text-gray-700">
                <strong>Size:</strong> {reservedProperty.size}
              </div>
              <div className="text-blue-600 font-semibold text-xl">
                {reservedProperty.displayPrice ||
                  formatPrice(reservedProperty.price)}
                {reservedProperty.priceFrequency && (
                  <span className="text-sm text-gray-500 ml-1">
                    per {reservedProperty.priceFrequency}
                  </span>
                )}
              </div>
            </div>

            {/* Booking Status and Actions */}
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">
              Booking Status
            </h3>
            <div className="mb-4">
              <p className="text-green-600 font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your booking has been confirmed!
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelReservation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Reservation
              </button>
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}