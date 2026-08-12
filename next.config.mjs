/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  typescript: {
    ignoreBuildError: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
