// components/ContactSection.tsx
'use client';
import React, { memo, useMemo } from 'react';
import { Property } from '@rental/types';

interface ContactSectionProps {
  property: Property;
  formatPrice: (price: number) => string;
  bookingUrl?: string; // URL to your booking site
}

const ContactSection = memo(({ property, formatPrice, bookingUrl }: ContactSectionProps) => {
  // Calculate monthly pricing with proper fallbacks
  const monthlyPricing = useMemo(() => {
    const monthlyRate = property.price || 0; // Fallback to 0 if price is undefined
    const serviceFee = monthlyRate * 0.08; // Lower service fee for long-term rentals
    const securityDeposit = monthlyRate * 1.5; // Typical security deposit
    
    return {
      monthlyRate,
      serviceFee,
      securityDeposit,
      firstMonthTotal: monthlyRate + serviceFee + securityDeposit
    };
  }, [property.price]);

  const handleRequestBooking = () => {
    // Prepare complete property data for reservation dashboard
    const propertyData = {
      id: property.id,
      title: property.title || 'Untitled Property',
      address: property.address || 'Unknown Location',
      city: property.address ? property.address.split(',').pop()?.trim() : 'Unknown City',
      price: property.price?.toString() || '0',
      displayPrice: property.price ? `€${property.price.toLocaleString('de-DE')}` : 'Price on request',
      priceFrequency: 'month',
      bedrooms: property.beds?.toString() || '0',
      beds: property.beds?.toString() || '0',
      rooms: property.beds?.toString() || '0',
      bathrooms: property.baths?.toString() || '0',
      baths: property.baths?.toString() || '0',
      size: property.area ? `${property.area} m²` : 'N/A',
      area: property.area?.toString() || '0',
      propertyType: property.type || 'Apartment',
      location: property.address || 'Unknown Location',
      featuredImage: property.image_urls?.[0] || '/placeholder-property.jpg',
      images: property.image_urls || [],
      galleryImages: property.image_urls || [],
      imageUrl: property.image_urls?.[0] || '/placeholder-property.jpg',
      url: `/properties/${property.id}`,
      available: property.available !== false,
      description: property.description || '',
      lat: property.lat,
      lng: property.lng,
      created_at: property.created_at,
      updated_at: property.updated_at
    };
    
    // Store property data in localStorage for the reservation dashboard
    localStorage.setItem('selectedProperty', JSON.stringify(propertyData));
    
    // Construct URL with property ID
    const params = new URLSearchParams({
      propertyId: property.id || ''
    });
    
    // Determine the reservation dashboard URL
    const isDevelopment = window.location.hostname === 'localhost';
    let reservationDashboardUrl = '';
    
    if (isDevelopment) {
      // In development, reservation dashboard runs on port 3001
      reservationDashboardUrl = `http://localhost:3001/ReservationDashboard/dashboard?${params.toString()}`;
    } else {
      // In production, both apps are on studentrentals.es
      // Reservation dashboard is served from /ReservationDashboard path
      reservationDashboardUrl = bookingUrl || `/ReservationDashboard/dashboard?${params.toString()}`;
    }
    
    // Open reservation dashboard in new tab
    window.open(reservationDashboardUrl, '_blank');
  };

  // Don't render if no price is available
  if (!property.price || property.price <= 0) {
    return (
      <div className="sticky top-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Price on Request</h3>
            <p className="text-gray-600 text-sm mb-6">Contact us for pricing information</p>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Contact for Pricing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-8 space-y-6">
      {/* Main Booking Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="p-8">
          {/* Pricing Header */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatPrice(monthlyPricing.monthlyRate)}
            </div>
            <div className="text-gray-600 font-medium">per month</div>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Student-Friendly Rates
            </div>
          </div>

          {/* Rental Information */}
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Flexible Rental Terms
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Minimum rental: 3 months
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Maximum rental: 12 months
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Academic year discounts available
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  All utilities included
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-3 mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Monthly rent</span>
              <span className="text-gray-900 font-medium">{formatPrice(monthlyPricing.monthlyRate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service fee (one-time)</span>
              <span className="text-gray-900 font-medium">{formatPrice(monthlyPricing.serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Security deposit (refundable)</span>
              <span className="text-gray-900 font-medium">{formatPrice(monthlyPricing.securityDeposit)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">First month total</span>
                <span className="font-bold text-lg text-gray-900">
                  {formatPrice(monthlyPricing.firstMonthTotal)}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              *Subsequent months: {formatPrice(monthlyPricing.monthlyRate)} only
            </div>
          </div>

          {/* Request Booking Button */}
          <button
            onClick={handleRequestBooking}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4" />
              </svg>
              Request Booking
            </div>
          </button>

          <div className="text-center text-sm text-gray-500 mt-3">
            Choose your rental period on the next page
          </div>
        </div>
      </div>

      {/* Student Services */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Student Support
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Property Manager
            </button>
            
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Schedule Virtual Tour
            </button>

            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Save to Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Student Guarantee */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Student-First Guarantee</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Student ID verification only</li>
                <li>• No credit score requirements</li>
                <li>• Flexible payment plans</li>
                <li>• Study-friendly environment</li>
                <li>• Emergency maintenance 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;