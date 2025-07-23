"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PropertyData } from "../../types";
// import { auth, db } from "../../firebase";
// import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function ReservePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionError, setSubmissionError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check for current user and set userId
    // Placeholder: Mock user authentication
    const mockUser = { uid: "mock-user-123", email: "user@example.com" };
    if (mockUser) {
      setUserId(mockUser.uid);
    }

    // Get the property data from localStorage
    const propertyToReserve = localStorage.getItem("propertyToReserve");
    if (propertyToReserve) {
      try {
        const parsedData = JSON.parse(propertyToReserve);
        console.log("Property data retrieved from localStorage:", parsedData);
        setPropertyData(parsedData);
      } catch (error) {
        console.error("Error parsing property data:", error);
      }
    } else {
      console.log("No property data found in localStorage");
    }
    setIsLoading(false);
  }, []);

  const handleAccept = async () => {
    setIsSubmitting(true);

    try {
      // Placeholder: Mock user authentication
      const currentUser = { uid: "mock-user-123", email: "user@example.com" };
      if (!propertyData || !currentUser) {
        throw new Error("Missing property data or user information");
      }

      // Update userId if not set
      if (!userId) {
        setUserId(currentUser.uid);
      }

      // Get user profile data from user-specific localStorage
      const localStorageKey = `userProfile_${currentUser.uid}`;
      const storedProfile = localStorage.getItem(localStorageKey);
      const userProfile = storedProfile ? JSON.parse(storedProfile) : {};

      // Placeholder: Simulate creating reservation record
      const reservationId = `${propertyData.id}_${
        currentUser.uid
      }_${Date.now()}`;
      
      // Mock Firebase setDoc operation
      console.log("Mock: Creating reservation with ID:", reservationId);
      console.log("Mock: Reservation data:", {
        propertyId: propertyData.id,
        propertyTitle: propertyData.title,
        rentersUid: currentUser.uid,
        renterEmail: currentUser.email,
        renterPhone: userProfile.phone,
        renterName: userProfile.fullName,
        ownerUid: propertyData.ownerId, // Ensure PropertyData now includes ownerId
        status: "pending",
        createdAt: new Date().toISOString(),
        renterProfile: userProfile,
      });
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store reservation data locally
      localStorage.setItem("reservedProperty", JSON.stringify(propertyData));
      localStorage.setItem("justReserved", "true");
      localStorage.setItem("reservationId", reservationId);

      // Navigate back to dashboard with a reserved flag
      router.push("/dashboard?reserved=true");
    } catch (error) {
      console.error("Error submitting reservation:", error);
      setSubmissionError("Failed to submit reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to dashboard
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reservation Contract</h1>

      {propertyData ? (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Property Details</h2>
          <p className="font-medium">{propertyData.title}</p>
          <p className="text-blue-600 font-semibold">
            {propertyData.displayPrice || propertyData.price}
            {propertyData.priceFrequency && (
              <span className="text-sm text-gray-500 ml-1">
                per {propertyData.priceFrequency}
              </span>
            )}
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 border rounded-lg bg-red-50 text-red-700">
          No property data found. Please return to the dashboard and select a
          property.
        </div>
      )}

      <p className="mb-4 text-gray-700">
        Please review the following contract before confirming your reservation.
        By accepting the contract, you agree to the terms and conditions below.
      </p>
      <div className="border p-4 rounded-lg mb-6 bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Terms & Conditions</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            Your reservation is subject to availability and confirmation by our
            team.
          </li>
          <li>
            A non-refundable deposit may be required to secure your booking.
          </li>
          <li>
            Please ensure that all information provided is accurate and
            complete.
          </li>
          <li>You are responsible for any damage or loss during your stay.</li>
          <li>Cancellation policies apply as outlined during booking.</li>
          <li>
            All reservations are subject to our privacy policy and terms of
            service.
          </li>
        </ul>
      </div>
      {submissionError && (
        <div className="mb-4 p-4 border rounded-lg bg-red-50 text-red-700">
          {submissionError}
        </div>
      )}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAccept}
          disabled={isSubmitting || !propertyData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          {isSubmitting
            ? "Processing..."
            : "Accept Contract & Confirm Reservation"}
        </button>
      </div>
    </div>
  );
}
