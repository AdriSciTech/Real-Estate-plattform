// apps/reservation-dashboard/next.config.js
module.exports = {
  // Use basePath only in production when serving from subpath
  basePath: process.env.NODE_ENV === 'production' ? '/reservations' : '',
  
  // Asset prefix for CDN support (optional)
  assetPrefix: process.env.NODE_ENV === 'production' ? '/reservations' : '',
  
  // Other Next.js config options
  reactStrictMode: true,
  swcMinify: true,
  
  // Handle images from external sources
  images: {
    domains: [
      'localhost',
      'studentrentals.es',
      // Add your Supabase storage domain
      'your-supabase-project.supabase.co',
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_LISTINGS_URL: process.env.NODE_ENV === 'production' 
      ? 'https://studentrentals.es' 
      : 'http://localhost:3000',
  },
  
  // Redirect old routes if needed
  async redirects() {
    return [
      {
        source: '/ReservationDashboard/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/ReservationDashboard',
        destination: '/',
        permanent: true,
      },
    ];
  },
}