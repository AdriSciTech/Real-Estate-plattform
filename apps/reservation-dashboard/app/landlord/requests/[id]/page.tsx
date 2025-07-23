"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
// Firebase imports commented out - replace with Supabase or API calls
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { db } from "../../../../firebase";

export default function RequestDetailsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
 // Get the dynamic route parameter

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");

  // Fetch request details when component mounts
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("landlordLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/landlord/login");
      return;
    }

    async function getRequest() {
      try {
        // TODO: Replace with Supabase or API call
        // const docRef = doc(db, "bookingRequests", id);
        // const docSnap = await getDoc(docRef);
        
        // Placeholder data for development
        const mockData = {
          id,
          propertyTitle: "Sample Property",
          price: "€1,200/month",
          requestDate: new Date(),
          userName: "John Doe",
          userEmail: "john.doe@example.com",
          userPhone: "+1234567890",
          status: "pending",
          landlordNotes: "",
          property: {
            rooms: 2,
            bathrooms: 1,
            size: "75m²"
          },
          userProfile: {
            income: "€3,000/month",
            employment: "Software Developer"
          }
        };
        
        setRequest(mockData);
        if (mockData.landlordNotes) {
          setNotes(mockData.landlordNotes);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching request:", err);
        setError("Failed to load request details");
        setLoading(false);
      }
    }
    
    getRequest();
  }, [id, router]);

  // Handle status update
  const updateStatus = async (status: string) => {
    setUpdating(true);
    setSuccess("");
    
    try {
      // TODO: Replace with Supabase or API call
      // await updateDoc(doc(db, "bookingRequests", id), {
      //   status,
      //   landlordNotes: notes,
      //   updatedAt: new Date()
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRequest({ ...request, status });
      setSuccess(`Request ${status === "approved" ? "approved" : "declined"} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update request status");
    } finally {
      setUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
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

  if (!request) {
    return <div className="text-center py-12">Request not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push("/landlord")}
          className="text-blue-600 hover:underline flex items-center"
        >
          ← Back to Dashboard
        </button>
        
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          request.status === "approved" ? "bg-green-100 text-green-800" :
          request.status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {request.status === "approved" ? "Approved" :
           request.status === "rejected" ? "Declined" : "Pending"}
        </span>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Booking Request Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Property Info */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Property</h2>
            <p className="mb-2"><strong>Title:</strong> {request.propertyTitle || "Unnamed Property"}</p>
            <p className="mb-2"><strong>Price:</strong> {request.price || "N/A"}</p>
            <p className="mb-2"><strong>Date Requested:</strong> {formatDate(request.requestDate)}</p>
            
            {request.property && (
              <>
                {request.property.rooms && <p className="mb-2"><strong>Bedrooms:</strong> {request.property.rooms}</p>}
                {request.property.bathrooms && <p className="mb-2"><strong>Bathrooms:</strong> {request.property.bathrooms}</p>}
                {request.property.size && <p className="mb-2"><strong>Size:</strong> {request.property.size}</p>}
              </>
            )}
          </div>
          
          {/* Tenant Info */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Tenant</h2>
            <p className="mb-2"><strong>Name:</strong> {request.userName || "Unknown"}</p>
            <p className="mb-2"><strong>Email:</strong> {request.userEmail || "N/A"}</p>
            <p className="mb-2"><strong>Phone:</strong> {request.userPhone || "N/A"}</p>
            
            {request.userProfile && (
              <>
                {request.userProfile.income && <p className="mb-2"><strong>Income:</strong> {request.userProfile.income}</p>}
                {request.userProfile.employment && <p className="mb-2"><strong>Employment:</strong> {request.userProfile.employment}</p>}
              </>
            )}
          </div>
        </div>
        
        {/* Response section */}
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">Your Response</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Add notes about this booking request"
              disabled={request.status !== "pending" || updating}
            ></textarea>
          </div>
          
          {request.status === "pending" ? (
            <div className="flex space-x-4">
              <button
                onClick={() => updateStatus("approved")}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-70"
              >
                {updating ? "Processing..." : "Approve"}
              </button>
              <button
                onClick={() => updateStatus("rejected")}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-70"
              >
                Decline
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p>This request has been {request.status === "approved" ? "approved" : "declined"}.</p>
              {request.landlordNotes && (
                <div className="mt-2">
                  <p className="font-medium">Notes:</p>
                  <p>{request.landlordNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
