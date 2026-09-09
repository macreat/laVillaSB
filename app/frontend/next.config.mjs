/* Where the storefront forwards gateway calls. Compose leaves it unset and gets
   the internal service name; a Vercel build sets it to the VPS API hostname,
   since there is no docker network there. Read at config time on purpose:
   rewrites are baked into routes-manifest during the build, so a runtime-only
   value never reaches them. */
const GATEWAY_ORIGIN = process.env.GATEWAY_ORIGIN || 'http://gateway:8010';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    // Disable Next.js image optimization - media proxy handles serving
    unoptimized: true,
  },
  /* Same-origin API. The browser calls /api/... on whatever host it loaded
     the page from, and Next forwards it to the gateway. That means the bundle
     no longer hardcodes a host, so the same build works from localhost, from a
     LAN IP, or from a phone, with no rebuild. These run after filesystem
     routes, so /api/media/* stays with the app's own handler. */
  async rewrites() {
    /* Scoped to the two gateway prefixes on purpose. A blanket /api/:path*
       also swallowed /api/media/*, which is this app's own MinIO proxy, and
       every product image 404'd. */
    return [
      { source: '/api/v1/:path*', destination: `${GATEWAY_ORIGIN}/api/v1/:path*` },
      { source: '/api/admin/:path*', destination: `${GATEWAY_ORIGIN}/api/admin/:path*` },
    ];
  },
};

export default nextConfig;
