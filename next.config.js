const path = require("path");

const internalApi =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid wrong workspace root when a lockfile exists outside this project (e.g. user home).
  turbopack: {
    root: path.join(__dirname),
  },
  /** CLICK merchant — bir domen: https://weblinker.uz/api/payments/click/... */
  async rewrites() {
    return [
      {
        source: "/api/payments/click/:path*",
        destination: `${internalApi}/api/payments/click/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;