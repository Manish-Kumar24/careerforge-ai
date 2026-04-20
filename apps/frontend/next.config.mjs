// apps\frontend\next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Disable Turbopack for production builds (required for @react-pdf/renderer)
  // This only affects `next build`, not `next dev`
  turbopack: false,
  
  // ✅ Only proxy /api routes to backend, let React handle everything else
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/:path*',
      },
    ];
  },
  
  // ✅ Ensure React app renders for all other routes
  reactStrictMode: true,
  
  // ✅ Optional: Optimize webpack for @react-pdf/renderer (prevents "module not found")
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