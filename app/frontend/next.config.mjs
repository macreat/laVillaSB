/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    // Disable Next.js image optimization - media proxy handles serving
    unoptimized: true,
  },
  /* Same-origin API. The browser calls /api/... on whatever host it loaded
     the page from, and Next forwards it to the gateway over the internal
     docker network. That means the bundle no longer hardcodes a host, so the
     same build works from localhost, from a LAN IP, or from a phone, with no
     rebuild. These run after filesystem routes, so /api/media/* stays with
     the app's own handler. */
  async rewrites() {
    /* Hardcoded to the compose service name on purpose: rewrites are baked
       into routes-manifest at build time, when runtime env is not present.
       Reading API_INTERNAL_URL here silently picked up a stale value and
       proxied to 127.0.0.1, which is nothing inside this container. */
    /* Scoped to the two gateway prefixes on purpose. A blanket /api/:path*
       also swallowed /api/media/*, which is this app's own MinIO proxy, and
       every product image 404'd. */
    return [
      { source: '/api/v1/:path*', destination: 'http://gateway:8010/api/v1/:path*' },
      { source: '/api/admin/:path*', destination: 'http://gateway:8010/api/admin/:path*' },
    ];
  },
};

export default nextConfig;
