/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Exclude api folder from Next.js build
    config.ignoreWarnings = [
      ...config.ignoreWarnings || [],
      { module: /api\// },
    ];
    
    return config;
  },
}

module.exports = nextConfig