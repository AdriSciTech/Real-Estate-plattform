const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for monorepo shared types
  webpack: (config) => {
    config.resolve.alias = {
  ...config.resolve.alias,
  '@rental/types': path.resolve(__dirname, '../../packages/types/src'),
  '@rental/google-maps': path.resolve(__dirname, '../../packages/google-maps/src'),
  '@rental/supabase': path.resolve(__dirname, '../../packages/supabase/src'),
  '@rental/image-handling': path.resolve(__dirname, '../../packages/image-handling/src'),
};
    return config;
  },
  
  // Transpile shared packages
  transpilePackages: ['@rental/types', '@rental/google-maps', '@rental/supabase', '@rental/image-handling'],
  
  images: {
    domains: [
      'spaindreamhome.com',
      'supabase.com',
      'your-supabase-project.supabase.co',
      'img.studentrentals.es',
      'studentrentals.es'
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  }
}

module.exports = nextConfig