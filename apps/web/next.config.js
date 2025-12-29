/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@pharmacy/ui", "@pharmacy/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./packages/**/*"],
    },
  },
};

module.exports = nextConfig;

