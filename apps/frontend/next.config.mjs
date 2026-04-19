// apps\frontend\next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbo: {
    rules: {
      // Exclude @react-pdf from Turbopack optimization
      '*.js': {
        as: '*.js',
      },
    },
  },
  // ✅ Only proxy /api routes to backend, let React handle everything else
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // ✅ Ensure React app renders for all other routes
  reactStrictMode: true,
};

export default nextConfig;