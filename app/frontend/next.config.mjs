/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    // Disable Next.js image optimization - media proxy handles serving
    unoptimized: true,
  },
};

export default nextConfig;
