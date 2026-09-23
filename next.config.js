/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // In production, replace "**" with your real image host(s) for tighter security.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

module.exports = nextConfig;
