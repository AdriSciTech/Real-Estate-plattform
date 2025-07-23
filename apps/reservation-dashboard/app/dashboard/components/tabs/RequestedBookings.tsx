"use client";

import { useEffect, useState } from "react";
import { supabase, auth } from "../../../../lib/supabase";
import Link from "next/link";

interface BookingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  price: string;
  priceFrequency: string | null;
  requestDate: Date;
  status: "pending" | "approved" | "rejected";
  ownerEmail: string;
}

export default function RequestedBookingsTab() {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const fetchBookingRequests = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo("Starting to fetch booking requests...");

      try {
        const { data: { user } } = await auth.getSession();
        if (!user) {
          throw new Error("User not authenticated");
        }

        setDebugInfo(prev => prev + "\nUser authenticated. ID: " + user.id);

        // First, get all booking requests to see what's there
        const { data: allBookings, error: allError } = await supabase
          .from('booking_requests')
          .select('*');

        if (allError) {
          throw allError;
        }

        setDebugInfo(prev => prev + `\nFound ${allBookings?.length || 0} total booking requests in the collection.`);

        // Now get user-specific bookings with property details
        const { data: userBookings, error: userError } = await supabase
          .from('booking_requests')
          .select(`
            *,
            properties (
              id,
              title,
              images,
              price,
              price_frequency
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userError) {
          throw userError;
        }

        setDebugInfo(prev => prev + `\nFound ${userBookings?.length || 0} booking requests for this user.`);

        const requests: BookingRequest[] = [];

        userBookings?.forEach((booking) => {
          setDebugInfo(prev => prev + `\nProcessing booking ID: ${booking.id}`);
          
          // Handle date conversion safely
          let requestDate: Date;
          if (booking.created_at) {
            requestDate = new Date(booking.created_at);
          } else {
            requestDate = new Date(); // Fallback to current date
          }

          // Get property details
          const property = booking.properties;
          
          requests.push({
            id: booking.id,
            propertyId: booking.property_id || "",
            propertyTitle: property?.title || "Unnamed Property",
            propertyImage: property?.images?.[0] || "",
            price: property?.price?.toString() || "",
            priceFrequency: property?.price_frequency || null,
            requestDate: requestDate,
            status: booking.status || "pending",
            ownerEmail: booking.owner_email || ""
          });
        });

        setBookingRequests(requests);
        setDebugInfo(prev => prev + `\nProcessed ${requests.length} booking requests successfully.`);
      } catch (err: any) {
        console.error("Error fetching booking requests:", err);
        setError(`Failed to load your booking requests: ${err.message}`);
        setDebugInfo(prev => prev + `\nError: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Declined
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Pending
          </span>
        );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm">Debug Information</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs whitespace-pre-wrap">{debugInfo}</pre>
        </details>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (bookingRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Booking Requests Yet</h3>
        <p className="text-gray-500 mb-4">You haven't made any booking requests yet.</p>
        
        <details className="mt-4 text-left max-w-lg mx-auto">
          <summary className="cursor-pointer text-sm text-gray-500">Debug Information</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-left whitespace-pre-wrap">{debugInfo}</pre>
        </details>
        
        <a
          href="https://spaindreamhome.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Find Properties
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-1 py-4">
      <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">Your Booking Requests</h2>
      
      <div className="space-y-4">
        {bookingRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-56 md:h-auto relative">
                {request.propertyImage ? (
                  <img
                    src={request.propertyImage}
                    alt={request.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{request.propertyTitle}</h3>
                    <div className="text-gray-600 mb-2">Request date: {formatDate(request.requestDate)}</div>
                    <div className="font-bold text-blue-600 text-lg mb-4">
                      {request.price}
                      {request.priceFrequency && (
                        <span className="text-sm text-gray-500 ml-1">per {request.priceFrequency}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                
                <div className="mt-6">
                  {request.status === "approved" ? (
                    <Link 
                      href={`/payment/${request.id}`} 
                      className="px-5 py-2 bg-green-600 text-white rounded-md inline-block hover:bg-green-700 transition-colors font-medium"
                    >
                      Complete Booking
                    </Link>
                  ) : request.status === "rejected" ? (
                    <div className="text-sm text-gray-600">
                      This request was declined by the property owner.
                      <a
                        href="https://spaindreamhome.com"
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline ml-2"
                      >
                        Browse more properties
                      </a>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      Awaiting response from property owner. You'll be notified when they respond.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}