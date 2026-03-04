/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify was removed in Next.js 15 — SWC minification is now always on
  //
  // NEXT_PUBLIC_API_URL is intentionally NOT set here with a fallback.
  // - .env.local      → http://localhost:8000  (local dev)
  // - .env.production → ""                     (production: Firebase rewrites /api/** to Cloud Run)
  // api-client.ts uses !== undefined so an empty string is respected as-is.
}

module.exports = nextConfig
