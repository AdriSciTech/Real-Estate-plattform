"use client";

import { useEffect, useState, useRef, use } from "react"; // 👈 Add `use` from React
import { useRouter } from "next/navigation";
// import { auth } from "../../../../firebase";
import Link from "next/link";
import { fetchContractData, generateContractPDF } from "../contractService";
import dynamic from 'next/dynamic';

// Dynamic import for PDF viewer components (client-side only)
const PDFViewer = dynamic(() => import('../components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  )
});

// Accept params as a Promise, then unwrap
export default function ContractReviewPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params); // 👈 Unwrap params with React.use()
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const router = useRouter();
  const contractRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadContract = async () => {
      setLoading(true);
      setError(null);

      try {
        // Placeholder for auth check
        // const user = auth.currentUser;
        const user = null; // Placeholder - in production, get from auth
        if (!user) {
          throw new Error("You must be logged in to view this page");
        }

        // For demo purposes, use a mock user ID
        const mockUserId = "mock-user-id";
        const contractData = await fetchContractData(mockUserId, bookingId);
        if (!contractData) {
          throw new Error("Could not generate contract data");
        }

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
  }, [bookingId]);

  const proceedToSignContract = () => {
    router.push(`/payment/${bookingId}/sign`);
  };

  const handleDownloadPDF = () => {
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'property-contract.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

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
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">1</div>
          <span className="mx-2 text-lg font-semibold">Review Contract</span>
        </div>
        <div className="w-12 h-1 bg-gray-300 mx-2"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-500 text-gray-500">2</div>
          <span className="mx-2 text-lg text-gray-500">Sign Contract</span>
        </div>
        <div className="w-12 h-1 bg-gray-300 mx-2"></div>
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-500 text-gray-500">3</div>
          <span className="mx-2 text-lg text-gray-500">Pay Reservation</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">Step 1: Review Contract</h2>
        <p className="mb-6 text-gray-600">
          Please review the contract details carefully. This contract contains important information about your booking.
          You will be asked to sign this document in the next step.
        </p>

        {/* PDF Viewer */}
        <div ref={contractRef} className="border border-gray-300 rounded-lg overflow-auto h-96 mb-6 flex justify-center bg-gray-100">
          {pdfBytes ? (
            <PDFViewer pdfBytes={pdfBytes} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Contract not available</p>
            </div>
          )}
        </div>

        {/* Download Option */}
        <div className="mb-8 flex justify-center">
          <button 
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Contract
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={proceedToSignContract}
            className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700 transition-colors flex-1 max-w-xs"
          >
            Proceed to Sign
          </button>
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md text-lg font-medium hover:bg-gray-50 transition-colors flex-1 max-w-xs text-center"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
