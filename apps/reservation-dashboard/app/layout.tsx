// app/ReservationDashboard/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Dashboard - SpainDreamHome",
  description: "Manage your property reservations and bookings",
};

export default function ReservationDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Don't render html/body tags here - they're already in the root layout
  return <>{children}</>;
}