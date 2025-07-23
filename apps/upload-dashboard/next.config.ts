const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack configuration for monorepo shared types
  webpack: (config: any) => {
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
      'studentrentals.es',            // Your main domain
      'img.studentrentals.es',        // Your R2 custom domain (correct name)
      'jyckdewdissldhyvplag.supabase.co', // Supabase direct access
      'lh3.googleusercontent.com',    // Google avatars or images
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'studentrentals.es',
        pathname: '/cdn-cgi/image/**', // Cloudflare Polish/Resize pattern
      },
      {
        protocol: 'https',
        hostname: 'img.studentrentals.es',
        pathname: '/**', // Your R2 custom image path
      },
      {
        protocol: 'https',
        hostname: 'jyckdewdissldhyvplag.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-4ac2ecbe241249afa6c227aa82643057.r2.dev',
        pathname: '/**', // Fallback in case custom domain fails
      },
    ],
  },
}

module.exports = nextConfig