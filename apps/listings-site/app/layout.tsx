//listings-plattform\app\layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/apps/listings-site/components/Header'
import Footer from '@/apps/listings-site/components/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  title: 'SpainDreamHome - Premium Real Estate in Spain',
  description: 'Find your perfect property in Spain. Premium real estate listings, expert guidance, and exceptional service for international buyers.',
  keywords: 'Spain real estate, property Spain, houses Spain, apartments Spain, villas Spain, Costa del Sol, Madrid properties',
  authors: [{ name: 'SpainDreamHome' }],
  creator: 'SpainDreamHome',
  publisher: 'SpainDreamHome',
  robots: 'index, follow',
  // viewport moved to viewport.ts file
  openGraph: {
    title: 'SpainDreamHome - Premium Real Estate in Spain',
    description: 'Find your perfect property in Spain. Premium real estate listings, expert guidance, and exceptional service for international buyers.',
    url: 'https://spaindreamhome.com',
    siteName: 'SpainDreamHome',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SpainDreamHome - Premium Real Estate in Spain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpainDreamHome - Premium Real Estate in Spain',
    description: 'Find your perfect property in Spain. Premium real estate listings, expert guidance, and exceptional service for international buyers.',
    creator: '@spaindreamhome',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://spaindreamhome.com',
  },
  other: {
    'theme-color': '#3b82f6',
    'color-scheme': 'light',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`scroll-smooth ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light" />
        
        {/* Additional meta tags for mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SpainDreamHome" />
      </head>
      <body 
        className="font-sans antialiased overflow-x-hidden min-h-screen"
        suppressHydrationWarning
      >
        {/* Skip link for accessibility */}
        <a 
          href="#main-content" 
          className="skip-link"
          aria-label="Skip to main content"
        >
          Skip to main content
        </a>
        
        <div className="min-h-screen flex flex-col overflow-x-hidden">
          <Header />
          <main 
            id="main-content"
            className="flex-grow overflow-x-hidden"
            role="main"
          >
            {children}
          </main>
          <Footer />
        </div>
        
        {/* Scroll restoration and performance optimizations */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent FOUC (Flash of Unstyled Content)
              document.documentElement.style.visibility = 'visible';
              
              // Optimize scroll restoration
              if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
              }
            `,
          }}
        />
      </body>
    </html>
  )
}