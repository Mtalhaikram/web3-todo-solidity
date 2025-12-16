import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['app', 'lib'],
    // Warning: Allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript type checking during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
