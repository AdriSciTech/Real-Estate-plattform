//app/home/page.tsx
"use client";

import HeroSection from "./components/HeroSection";
import ContactForm from "./components/ContactForm";
import LatestListings from "./components/LatestListings";

export default function HomePage() {
  return (
    <div className="bg-white overflow-x-hidden">
      {/* Hero Section with Search */}
      <div className="w-full overflow-hidden">
        <HeroSection />
      </div>

      {/* Latest Properties Section */}
      <LatestListings limit={6} showFeatured={false} className="bg-gray-50" />

      {/* Contact Form Section */}
      <ContactForm className="bg-gradient-to-br from-blue-50 via-white to-blue-100" />
    </div>
  );
}