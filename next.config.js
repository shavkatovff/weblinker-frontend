const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid wrong workspace root when a lockfile exists outside this project (e.g. user home).
  turbopack: {
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;