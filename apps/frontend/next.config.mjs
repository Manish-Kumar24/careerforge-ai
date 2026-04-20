// apps\frontend\next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Next.js 16: turbopack must be an object, not boolean
  // Empty object disables Turbopack optimizations but keeps Webpack fallbacks
  turbopack: {},
  
  // ✅ Only proxy /api routes to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/:path*',
      },
    ];
  },
  
  reactStrictMode: true,
  
  // ✅ Webpack config for @react-pdf/renderer compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;