const path = require("path");

/** Nest ichki manzil — bir domen rejimida rewrites shu yerga yo‘naltiradi */
const internalApi =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid wrong workspace root when a lockfile exists outside this project (e.g. user home).
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: `${internalApi}/auth/:path*` },
      { source: "/vizitka/:path*", destination: `${internalApi}/vizitka/:path*` },
      { source: "/telegram/:path*", destination: `${internalApi}/telegram/:path*` },
      { source: "/payments/:path*", destination: `${internalApi}/payments/:path*` },
      { source: "/health", destination: `${internalApi}/health` },
      {
        source: "/api/payments/click/:path*",
        destination: `${internalApi}/api/payments/click/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${internalApi}/uploads/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${internalApi}/api/admin/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/gradeadmin", permanent: false },
      { source: "/admin/:path*", destination: "/gradeadmin/:path*", permanent: false },
    ];
  },
};

module.exports = nextConfig;