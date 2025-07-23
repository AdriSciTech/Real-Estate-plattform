"use client";

import React, { useEffect, useState, use } from "react"; // use() for unwrapping params
import { useRouter } from "next/navigation";
// import { doc, updateDoc, Timestamp } from "firebase/firestore";
// import { db, auth } from "../../../../firebase";
import Link from "next/link";
import { fetchContractData, generateContractPDF } from "../contractService";
import dynamic from 'next/dynamic';

// Dynamic import for signature pad component
const SignaturePad = dynamic(() => import('../components/SignaturePad'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-md h-40 flex items-center justify-center">Loading signature pad...</div>
});

// Dynamic import for PDF viewer
const PDFViewer = dynamic(() => import('../components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  )
});

export default function ContractSignPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params); // unwrap params using use()

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const router = useRouter();
  
  // Add auth state tracking
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Monitor auth state changes
  useEffect(() => {
    // Placeholder for auth state monitoring
    // const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    //   setUser(currentUser);
    //   setAuthChecked(true);
    // });
    
    // For now, just set auth as checked with no user
    setUser(null);
    setAuthChecked(true);
    
    // Clean up the listener when component unmounts
    // return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only proceed if auth state has been determined
    if (!authChecked) return;
    
    const loadContract = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error("You must be logged in to view this page");
        }

        const contractData = await fetchContractData(user.uid, bookingId);
        if (!contractData) throw new Error("Could not generate contract data");

        const pdfBytes = await generateContractPDF(contractData);
        setPdfBytes(pdfBytes);
      } catch (err: any) {
        console.error("Error generating contract:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [bookingId, authChecked, user]);

  const handleSignatureCapture = (signatureDataUrl: string) => {
    setSignatureData(signatureDataUrl);
  };

  const handleSignContract = async () => {
    if (!agreedToTerms || !signatureData) {
      alert("Please agree to the terms and add your signature before proceeding.");
      return;
    }

    setIsSigning(true);

    try {
      // Placeholder for Firebase update
      // const bookingRef = doc(db, "bookingRequests", bookingId);
      // await updateDoc(bookingRef, {
      //   contractSigned: true,
      //   contractSignedDate: Timestamp.now(),
      //   signatureData: signatureData,
      // });
      
      // Simulate the update
      console.log("Would update booking with ID:", bookingId);
      console.log("Contract signed: true");
      console.log("Signature data captured");
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(`/payment/${bookingId}/reservation`);
    } catch (err: any) {
      console.error("Error signing contract:", err);
      setError(`Failed to sign contract: ${err.message}`);
    } finally {
      setIsSigning(false);
    }
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (authChecked && !user) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Authentication Required</h2>
        <p className="text-yellow-600 mb-4">You must be logged in to view this page.</p>
        <Link 
          href={`/login?returnTo=/payment/${bookingId}/sign`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">Finish Your Booking</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-400 text-gray-400">1</div>
          <span className="mx-2 text-lg text-gray-500">Review Contract</span>
        </div>
        <div className="w-12 h-1 bg-gray-300 mx-2"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">2</div>
          <span className="mx-2 text-lg font-semibold">Sign Contract</span>
        </div>
        <div className="w-12 h-1 bg-gray-300 mx-2"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-500 text-gray-500">3</div>
          <span className="mx-2 text-lg text-gray-500">Pay Reservation</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">Step 2: Sign Contract</h2>

        {/* Contract Summary */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Contract Summary</h3>
          <p className="text-gray-600 mb-2">
            You are about to sign a legally binding contract. By signing this document, 
            you agree to all terms and conditions outlined in the contract.
          </p>

          {/* PDF Preview */}
          <div className="border border-gray-300 rounded-lg overflow-hidden h-32 mb-4 flex justify-center bg-white">
            {pdfBytes && <PDFViewer pdfBytes={pdfBytes} />}
          </div>

          <div className="flex justify-center">
            <Link 
              href={`/payment/${bookingId}/review`}
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Review Full Contract
            </Link>
          </div>
        </div>

        {/* Signature Pad */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Your Signature</h3>
          <p className="text-gray-600 mb-4">Please sign in the box below using your mouse or touchscreen.</p>
          <div className="flex justify-center mb-4">
            <SignaturePad onSave={handleSignatureCapture} width={400} height={150} clearAfterSave={false} />
          </div>
          {signatureData && (
            <div className="text-center text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Signature captured
            </div>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-center mb-8">
          <input 
            type="checkbox" 
            id="agree-terms" 
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms(!agreedToTerms)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="agree-terms" className="ml-2 text-lg">
            I've read and agree to the terms of this contract.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleSignContract}
            disabled={isSigning || !agreedToTerms || !signatureData}
            className={`px-6 py-3 text-white rounded-md text-lg font-medium flex items-center justify-center flex-1 max-w-xs ${
              isSigning || !agreedToTerms || !signatureData
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isSigning ? (
              <>
                <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                Processing...
              </>
            ) : (
              'Sign Contract Now'
            )}
          </button>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors flex-1 max-w-xs text-center"
          >
            Sign Later
          </Link>
        </div>
      </div>
    </div>
  );
}