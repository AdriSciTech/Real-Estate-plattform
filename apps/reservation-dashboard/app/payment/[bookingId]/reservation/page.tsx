"use client";

import { useEffect, useState, use } from "react";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db, auth } from "../../../../firebase";
import Link from "next/link";
// import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";

interface BookingDetails {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  price: string;
  priceFrequency: string | null;
  status: string;
  contractSigned?: boolean;
  paymentStatus?: string;
  rooms?: string;
  bathrooms?: string; // Added bathrooms property
  size?: string; // Added size property
}

export default function ReservationPaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  
  // Auth state tracking
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Monitor auth state changes
  useEffect(() => {
    // Placeholder auth state monitoring - replace with actual auth logic
    // const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    //   setUser(currentUser);
    //   setAuthChecked(true);
    // });
    // return () => unsubscribe();
    
    // For now, just set auth as checked with no user
    setUser(null);
    setAuthChecked(true);
  }, []);

  // Check for success parameter in URL (for Stripe redirect)
  useEffect(() => {
    if (typeof window !== 'undefined' && booking) {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      
      if (success === 'true' && sessionId) {
        setPaymentSuccess(true);
        
        // Update booking and property in Firebase
        const updateAfterPayment = async () => {
          try {
            console.log("Starting post-payment updates for booking ID:", booking.id);
            
            // Placeholder for booking update logic
            console.log("Would update booking status to reserved for booking ID:", booking.id);
            console.log("Session ID:", sessionId);
            
            // Mock booking data
            const mockBookingData = {
              property: {
                rooms: "2",
                bathrooms: "1",
                size: "75m²"
              }
            };
            
            // Simulate successful update
            console.log("Booking status update simulated successfully");
            
            // Placeholder for property update logic
            try {
              const propertyId = booking.propertyId;
              console.log("Would update property status for property ID:", propertyId);
              
              // Simulate property update
              console.log("Property status update simulated successfully");
            } catch (propertyError) {
              console.error("Error in property update simulation:", propertyError);
            }
            
            console.log("All updates completed successfully");
            
            // Redirect to dashboard after short delay
            setRedirecting(true);
            setTimeout(() => {
              router.push('/dashboard?tab=reserved');
            }, 3000);
            
          } catch (err) {
            console.error("Error updating after payment:", err);
          }
        };
        
        updateAfterPayment();
      }
    }
  }, [booking, router]);

  // Fetch booking details once auth is checked
  useEffect(() => {
    if (!authChecked) return;
    
    const fetchBookingDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error("You must be logged in to view this page");
        }

        // Placeholder booking fetch - replace with actual data fetching
        // For demo purposes, using mock data
        const mockBookingData = {
          id: bookingId,
          userId: "mock-user-id",
          propertyId: "prop123",
          propertyTitle: "Modern Apartment in Barcelona",
          propertyImage: "/placeholder-property.jpg",
          price: "1500 €",
          priceFrequency: "month",
          status: "approved",
          contractSigned: true,
          paymentStatus: "pending"
        };
        
        // Simulate validation
        if (!user) {
          throw new Error("You must be logged in to view this page");
        }
        
        // For demo, always show the booking
        setBooking({
          id: mockBookingData.id,
          propertyId: mockBookingData.propertyId,
          propertyTitle: mockBookingData.propertyTitle,
          propertyImage: mockBookingData.propertyImage,
          price: mockBookingData.price,
          priceFrequency: mockBookingData.priceFrequency,
          status: mockBookingData.status,
          contractSigned: mockBookingData.contractSigned,
          paymentStatus: mockBookingData.paymentStatus
        });
      } catch (err: any) {
        console.error("Error fetching booking details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, authChecked, user]);

  // Stripe payment handler
  const handlePayment = async () => {
    if (!booking) return;
    setProcessingPayment(true);
    setError(null);

    try {
      // Placeholder for Stripe initialization
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
      // if (!stripe) throw new Error("Stripe failed to initialize");
      
      // Calculate deposit amount
      const basePrice = parseFloat(booking.price.replace(/[^0-9.]/g, ''));
      const depositAmount = (basePrice * 0.2 + 150).toFixed(2);
      
      // Placeholder for updating booking status to processing
      console.log("Would update booking status to processing for booking:", booking.id);

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          propertyTitle: booking.propertyTitle,
          depositAmount: depositAmount,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const session = await response.json();
      if (!session.id) throw new Error("Invalid session response");

      // Placeholder for Stripe checkout redirect
      console.log("Would redirect to Stripe checkout with session ID:", session.id);
      // Simulate redirect for demo purposes
      window.location.href = `${window.location.pathname}?success=true&session_id=${session.id}`;
      
    } catch (err) {
      console.error("Payment error:", err);
      
      // Placeholder for updating booking status to failed
      try {
        console.log("Would update booking status to failed for booking:", booking.id);
        console.log("Error:", err instanceof Error ? err.message : 'Unknown error');
      } catch (dbErr) {
        console.error("Error in status update simulation:", dbErr);
      }
      
      setError(err instanceof Error ? `Payment failed: ${err.message}` : "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Loading state while checking auth
  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Authentication required state
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Authentication Required</h2>
        <p className="text-yellow-600 mb-4">You must be logged in to view this page.</p>
        <Link 
          href={`/login?returnTo=/payment/${bookingId}/reservation`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Link 
          href="/dashboard/bookings" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Bookings
        </Link>
      </div>
    );
  }

  // Success state
  if (paymentSuccess) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-10">Booking Complete!</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Payment Successful</h2>
          <p className="text-gray-600 mb-8">
            Your reservation for <span className="font-semibold">{booking?.propertyTitle}</span> has been confirmed. 
            You will receive a confirmation email shortly with all the details.
          </p>
          
          {redirecting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
              <p>Redirecting to your dashboard...</p>
            </div>
          ) : (
            <Link 
              href="/dashboard?tab=reserved" 
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              View My Bookings
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Main payment page
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Complete Your Reservation</h1>
      
      {/* Property Summary Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Property Header with Image */}
        <div className="h-48 relative overflow-hidden">
          {booking?.propertyImage ? (
            <img
              src={booking.propertyImage}
              alt={booking.propertyTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        
        {/* Property Details */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{booking?.propertyTitle}</h2>
          <div className="font-bold text-blue-600 text-xl mb-4">
            {booking?.price}
            {booking?.priceFrequency && (
              <span className="text-sm text-gray-500 ml-1">per {booking.priceFrequency}</span>
            )}
          </div>
          
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Security Deposit (20%)</span>
                <span className="font-medium">
                  {booking?.price ? 
                    `${(parseFloat(booking.price.replace(/[^0-9.]/g, '')) * 0.2).toFixed(2)} €` : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Booking Fee</span>
                <span className="font-medium">150.00 €</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                <span>Total Due Now</span>
                <span className="text-blue-600">
                  {booking?.price ? 
                    `${(parseFloat(booking.price.replace(/[^0-9.]/g, '')) * 0.2 + 150).toFixed(2)} €` : 
                    'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Payment Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              You'll be redirected to our secure payment provider to complete your payment.
              Your card details are processed securely and are never stored on our servers.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={handlePayment}
              disabled={processingPayment}
              className={`px-6 py-3 text-white rounded-md text-lg font-medium flex-1 ${
                processingPayment ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors flex items-center justify-center`}
            >
              {processingPayment ? (
                <>
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </button>
            <Link 
              href="/dashboard"
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Having trouble? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a></p>
      </div>
    </div>
  );
}