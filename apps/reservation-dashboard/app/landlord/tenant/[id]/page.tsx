"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
// Firebase imports commented out - replace with Supabase or API calls
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../../../../firebase";

// Define specific types instead of using any
interface UserProfile {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  dateOfBirth?: string;
  income?: string;
  employment?: string;
  employerName?: string;
  employmentDuration?: string;
  [key: string]: string | undefined;
}

interface BookingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  price: string;
  priceFrequency: string | null;
  requestDate: {
    seconds: number;
    nanoseconds: number;
    toDate: () => Date;
  };
  status: "pending" | "approved" | "rejected";
  userName: string;
  userEmail: string;
  userPhone: string;
  userProfile?: UserProfile;
  property?: {
    id: string;
    title: string;
    price: string;
    displayPrice: string;
    priceFrequency: string;
    featuredImage: string;
    rooms: string;
    bathrooms: string;
    size: string;
  };
  landlordNotes?: string;
}

export default function TenantDetailsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
 // Retrieve the dynamic route parameter

  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTenantDetails = async () => {
    try {
      // TODO: Replace with Supabase or API call
      // const docRef = doc(db, "bookingRequests", id);
      // const docSnap = await getDoc(docRef);

      // Placeholder data for development
      const mockData: BookingRequest = {
        id,
        propertyId: "prop-123",
        propertyTitle: "Modern 2BR Apartment",
        propertyImage: "/placeholder.jpg",
        price: "€1,200",
        priceFrequency: "month",
        requestDate: {
          seconds: Date.now() / 1000,
          nanoseconds: 0,
          toDate: () => new Date()
        },
        status: "pending",
        userName: "Jane Smith",
        userEmail: "jane.smith@example.com",
        userPhone: "+1234567890",
        userProfile: {
          fullName: "Jane Smith",
          phone: "+1234567890",
          address: "123 Main Street",
          city: "Dublin",
          zipCode: "D01 F5P2",
          country: "Ireland",
          dateOfBirth: "1990-05-15",
          income: "€3,500/month",
          employment: "Full-time",
          employerName: "Tech Corp Ltd.",
          employmentDuration: "2 years"
        },
        property: {
          id: "prop-123",
          title: "Modern 2BR Apartment",
          price: "1200",
          displayPrice: "€1,200",
          priceFrequency: "month",
          featuredImage: "/placeholder.jpg",
          rooms: "2",
          bathrooms: "1",
          size: "85m²"
        },
        landlordNotes: "Tenant has good references from previous landlord."
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBookingRequest(mockData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tenant details:", err);
      setError("Failed to load tenant information");
      setLoading(false);
    }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("landlordLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/landlord/login");
      return;
    }

    fetchTenantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
        <button
          onClick={() => router.push("/landlord")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!bookingRequest) {
    return (
      <div className="max-w-4xl mx-auto mt-10 px-4 text-center">
        <p>No tenant information available</p>
        <button
          onClick={() => router.push("/landlord")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const userProfile = bookingRequest.userProfile || {};

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => router.push("/landlord")}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-6">Tenant Information</h1>
          
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                <p className="font-medium">{bookingRequest.userName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-medium">{bookingRequest.userEmail || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-medium">{bookingRequest.userPhone || "Not provided"}</p>
              </div>
              {userProfile.dateOfBirth && (
                <div>
                  <p className="text-gray-600 text-sm">Date of Birth</p>
                  <p className="font-medium">{userProfile.dateOfBirth}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Address Information */}
          {(userProfile.address || userProfile.city || userProfile.zipCode || userProfile.country) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                Address Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.address && (
                  <div>
                    <p className="text-gray-600 text-sm">Street Address</p>
                    <p className="font-medium">{userProfile.address}</p>
                  </div>
                )}
                {userProfile.city && (
                  <div>
                    <p className="text-gray-600 text-sm">City</p>
                    <p className="font-medium">{userProfile.city}</p>
                  </div>
                )}
                {userProfile.zipCode && (
                  <div>
                    <p className="text-gray-600 text-sm">Zip Code</p>
                    <p className="font-medium">{userProfile.zipCode}</p>
                  </div>
                )}
                {userProfile.country && (
                  <div>
                    <p className="text-gray-600 text-sm">Country</p>
                    <p className="font-medium">{userProfile.country}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Financial Information */}
          {(userProfile.income || userProfile.employment || userProfile.employerName || userProfile.employmentDuration) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                Financial Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.income && (
                  <div>
                    <p className="text-gray-600 text-sm">Monthly Income</p>
                    <p className="font-medium">{userProfile.income}</p>
                  </div>
                )}
                {userProfile.employment && (
                  <div>
                    <p className="text-gray-600 text-sm">Employment Status</p>
                    <p className="font-medium">{userProfile.employment}</p>
                  </div>
                )}
                {userProfile.employerName && (
                  <div>
                    <p className="text-gray-600 text-sm">Employer Name</p>
                    <p className="font-medium">{userProfile.employerName}</p>
                  </div>
                )}
                {userProfile.employmentDuration && (
                  <div>
                    <p className="text-gray-600 text-sm">Employment Duration</p>
                    <p className="font-medium">{userProfile.employmentDuration}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Property Interest */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
              Property Interest
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Property</p>
                <p className="font-medium">{bookingRequest.propertyTitle || "Not specified"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Price</p>
                <p className="font-medium">
                  {bookingRequest.price || "Not specified"}
                  {bookingRequest.priceFrequency && (
                    <span className="text-sm text-gray-500 ml-1">
                      per {bookingRequest.priceFrequency}
                    </span>
                  )}
                </p>
              </div>
              {bookingRequest.requestDate && (
                <div>
                  <p className="text-gray-600 text-sm">Request Date</p>
                  <p className="font-medium">
                    {new Date(bookingRequest.requestDate.seconds * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className={`font-medium ${
                  bookingRequest.status === "approved" ? "text-green-600" :
                  bookingRequest.status === "rejected" ? "text-red-600" :
                  "text-yellow-600"
                }`}>
                  {bookingRequest.status === "approved" ? "Approved" :
                   bookingRequest.status === "rejected" ? "Declined" : "Pending"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Additional Notes or Custom Fields */}
          {bookingRequest.landlordNotes && (
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                Landlord Notes
              </h2>
              <p className="whitespace-pre-line">{bookingRequest.landlordNotes}</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between">
            <button
              onClick={() => router.push("/landlord")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Back to Dashboard
            </button>
            
            {bookingRequest.status === "pending" && (
              <button
                onClick={() => router.push(`/landlord/requests/${id}`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Respond to Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
