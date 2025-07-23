// app/ReservationDashboard/dashboard/page.tsx
"use client";

import { Suspense } from "react";
import dynamic from 'next/dynamic';

// Create a shared loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Use dynamic import
const DashboardContent = dynamic(
  () => import('./DashboardContent'), 
  { ssr: false }
);

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}