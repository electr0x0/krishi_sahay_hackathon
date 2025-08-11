import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable Next.js Image Optimization globally to avoid _next/image URL issues for external API images
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sample-videos.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.w3schools.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      // Allow API host from env for Next/Image when used with unoptimized=false
      ...(process.env.NEXT_PUBLIC_HOSTNAME
        ? [
            { protocol: 'http', hostname: process.env.NEXT_PUBLIC_HOSTNAME, port: '8000', pathname: '/**' },
            { protocol: 'http', hostname: process.env.NEXT_PUBLIC_HOSTNAME, port: '', pathname: '/**' },
            { protocol: 'https', hostname: process.env.NEXT_PUBLIC_HOSTNAME, port: '', pathname: '/**' },
          ]
        : []),
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    // Disable ESLint during builds entirely
    ignoreDuringBuilds: true,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      }
    ];
  },
};

export default nextConfig;
