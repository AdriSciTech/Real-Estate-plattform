// hooks/usePropertyBooking.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyData } from "../types";
import { auth, db } from "../lib/supabase";

export function usePropertyBooking(property: PropertyData) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [alreadyRequested, setAlreadyRequested] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check profile completeness and existing booking requests
  useEffect(() => {
    const checkProfileAndExistingRequests = async () => {
      setIsCheckingProfile(true);
      try {
        const { data: { session } } = await auth.getSession();
        if (!session?.user) {
          setProfileComplete(false);
          setIsCheckingProfile(false);
          return;
        }

        setUserId(session.user.id);

        // Check if this property has already been requested by this user
        await checkExistingBookingRequest(session.user.id, property.id);

        // Check profile completeness - using user-specific localStorage key
        const localStorageKey = `userProfile_${session.user.id}`;
        const localStorageIsCompleteKey = `isProfileComplete_${session.user.id}`;

        const { data: profileData, error } = await db.getUserProfile(session.user.id);
        
        if (profileData && !error) {
          const requiredFields = ["first_name", "last_name", "phone", "email"];
          
          const complete = requiredFields.every(field => 
            profileData[field] && String(profileData[field]).trim() !== ""
          );
          
          setProfileComplete(complete);
          
          // Update user-specific localStorage with the latest data
          if (complete) {
            localStorage.setItem(localStorageKey, JSON.stringify(profileData));
            localStorage.setItem(localStorageIsCompleteKey, "true");
          }
        } else {
          // Fallback to user-specific localStorage if no Supabase data
          const storedProfile = localStorage.getItem(localStorageKey);
          const storedCompletion = localStorage.getItem(localStorageIsCompleteKey);
          
          if (storedCompletion === "true" && storedProfile) {
            setProfileComplete(true);
          } else if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            const requiredFields = ["first_name", "last_name", "phone", "email"];
            
            const complete = requiredFields.every(field => 
              profile[field] && String(profile[field]).trim() !== ""
            );
            
            setProfileComplete(complete);
            
            if (complete) {
              localStorage.setItem(localStorageIsCompleteKey, "true");
            }
          } else {
            setProfileComplete(false);
          }
        }
      } catch (err) {
        console.error("Error checking profile and existing requests:", err);
        setProfileComplete(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };
    
    checkProfileAndExistingRequests();
  }, [property.id]);

  // Check if the user has already requested this property
  const checkExistingBookingRequest = async (userId: string, propertyId: string) => {
    try {
      const { data: bookingRequests, error } = await db.getBookingRequests(userId);
      
      if (error) {
        console.error("Error checking existing booking requests:", error);
        return false;
      }
      
      const existingRequest = bookingRequests?.find(request => request.property_id === propertyId);
      
      if (existingRequest) {
        setAlreadyRequested(true);
        setDebugInfo(prev => prev + "Property already requested. ");
        
        // Update status message based on booking status
        if (existingRequest.status === "approved") {
          setError("You've already booked this property and your request was approved.");
        } else if (existingRequest.status === "rejected") {
          setError("Your previous booking request for this property was declined.");
        } else {
          setError("You've already requested this property. Please wait for the owner's response.");
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error checking existing booking requests:", err);
      return false;
    }
  };

  // Listen for updates to the booking if we have a booking ID
  useEffect(() => {
    if (!bookingId) return;
    
    // TODO: Implement real-time subscription with Supabase
    // For now, we'll poll for updates
    const pollForUpdates = setInterval(async () => {
      try {
        const { data, error } = await db.getBookingRequests(userId || '');
        if (data && !error) {
          const booking = data.find(b => b.id === bookingId);
          if (booking && booking.email_preview_url) {
            setEmailPreviewUrl(booking.email_preview_url);
            clearInterval(pollForUpdates);
          }
        }
      } catch (err) {
        console.error('Error polling for booking updates:', err);
      }
    }, 2000);
    
    return () => clearInterval(pollForUpdates);
  }, [bookingId, userId]);

  const handleRequestBooking = async () => {
    setIsSubmitting(true);
    setError(null);
    setDebugInfo("");
    setEmailPreviewUrl(null);
    setBookingSuccess(false);

    try {
      const { data: { session } } = await auth.getSession();
      if (!session?.user) {
        throw new Error("You must be logged in to request a booking");
      }

      // Check if profile is complete
      if (!profileComplete) {
        // Store property data before redirecting
        localStorage.setItem("currentProperty", JSON.stringify(property));
        
        setError("Please complete your profile before requesting a booking");
        router.push("/dashboard?tab=profile");
        return;
      }

      // Check if already requested
      if (alreadyRequested) {
        throw new Error("You've already requested this property");
      }

      // Double-check for existing booking request
      const alreadyBookedCheck = await checkExistingBookingRequest(session.user.id, property.id);
      if (alreadyBookedCheck) {
        throw new Error("You've already requested this property");
      }

      // Get the user profile data - using user-specific localStorage key
      let profileData = null;
      const localStorageKey = `userProfile_${session.user.id}`;
      
      try {
        // First try to get from Supabase
        const { data: userProfile, error } = await db.getUserProfile(session.user.id);
        
        if (userProfile && !error) {
          profileData = userProfile;
          setDebugInfo(prev => prev + "Found profile in Supabase. ");
        } else {
          // Fall back to user-specific localStorage
          const storedProfile = localStorage.getItem(localStorageKey);
          if (!storedProfile) {
            throw new Error("User profile data not found");
          }
          profileData = JSON.parse(storedProfile);
          setDebugInfo(prev => prev + "Using profile from localStorage. ");
        }
      } catch (profileError) {
        console.error("Error retrieving profile:", profileError);
        throw new Error("Could not retrieve user profile data");
      }

      // Prepare booking request data
      const bookingRequestData = {
        property_id: property.id,
        user_id: session.user.id,
        start_date: new Date().toISOString().split('T')[0], // Today as default
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: "pending" as const,
        message: `Booking request for ${property.title || "Unnamed Property"}`,
        total_amount: parseFloat(property.price?.toString() || "0") || 0
      };

      // Add to Supabase
      try {
        setDebugInfo(prev => prev + "Attempting to create booking request... ");
        const { data: newBooking, error } = await db.createBookingRequest(bookingRequestData);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setBookingId(newBooking?.[0]?.id || '');
        setBookingSuccess(true);
        setDebugInfo(prev => prev + `Success! Booking ID: ${newBooking?.[0]?.id}`);
        
        // Update local state to prevent duplicate requests
        setAlreadyRequested(true);
        
        // Wait a moment to see if our backend adds the email preview URL
        setTimeout(() => {
          // If we still don't have an email preview URL after 5 seconds, continue anyway
          if (!emailPreviewUrl) {
            router.push("/dashboard?tab=bookings");
          }
        }, 5000);
      } catch (supabaseError: any) {
        console.error("Supabase error:", supabaseError);
        setDebugInfo(prev => prev + `Supabase error: ${supabaseError.message || "Unknown error"}`);
        throw new Error(`Database error: ${supabaseError.message || "Could not save booking request"}`);
      }
    } catch (err: any) {
      console.error("Error creating booking request:", err);
      setError(`Failed to submit booking request: ${err.message || "Please try again"}`);
      setBookingSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToListingWebsite = () => {
    // Clear property data before navigating away
    localStorage.removeItem("currentProperty");
    localStorage.removeItem("propertyToReserve");
    
    // Navigate to the external website
    window.open("https://spaindreamhome.com", "_blank");
    
    // Also redirect the dashboard with clear_property parameter
    router.push("/dashboard?clear_property=true");
  };

  const viewBookings = () => {
    router.push("/dashboard?tab=bookings");
  };

  return {
    isSubmitting,
    error,
    profileComplete,
    isCheckingProfile,
    debugInfo,
    emailPreviewUrl,
    bookingSuccess,
    bookingId,
    alreadyRequested,
    userId,
    handleRequestBooking,
    goToListingWebsite,
    viewBookings,
    checkExistingBookingRequest
  };
}