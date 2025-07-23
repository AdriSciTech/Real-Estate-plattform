'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { auth } from "../../../firebase";
import { use } from "react"; // 👈 Needed to unwrap params

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const router = useRouter();

  const { bookingId } = use(params); // 👈 Properly unwrap the params

  useEffect(() => {
    // Placeholder authentication check - replace with actual auth logic
    const user = null; // Replace with actual user check
    if (!user) {
      router.push('/login');
      return;
    }

    router.replace(`/payment/${bookingId}/review`);
  }, [bookingId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}
