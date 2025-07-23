// app/ReservationDashboard/dashboard/layout.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (!session) {
        // Save current URL params before redirecting
        const urlParams = new URLSearchParams(window.location.search).toString();
        if (urlParams) {
          localStorage.setItem("propertyParams", urlParams);
        }
        // Redirect to login page
        router.push('/ReservationDashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Return just the children without any additional UI elements
  return <>{children}</>;
}