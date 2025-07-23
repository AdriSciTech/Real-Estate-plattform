// next.config.ts - FIXED VERSION based on working dashboard config
import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
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
      'studentrentals.es',                    // ✅ CRITICAL: Main domain for Cloudflare transforms
      'img.studentrentals.es',                // ✅ R2 custom domain (correct name)
      'jyckdewdissldhyvplag.supabase.co',    // Supabase (legacy)
      'lh3.googleusercontent.com',            // Google avatars
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'studentrentals.es',
        port: '',
        pathname: '/cdn-cgi/image/**',         // ✅ CRITICAL: Cloudflare image transforms
      },
      {
        protocol: 'https',
        hostname: 'img.studentrentals.es',    // ✅ Correct R2 domain
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-4ac2ecbe241249afa6c227aa82643057.r2.dev',
        port: '',
        pathname: '/**',                       // ✅ R2 fallback domain
      },
    ],
    
    // Additional quality settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
}

export default nextConfig