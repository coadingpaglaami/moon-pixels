import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Provide a mock localStorage for server-side rendering
      config.resolve.alias = {
        ...config.resolve.alias,
        'node-localstorage': false,
      };
    }
    return config;
  },
  // Disable server-side rendering for pages that use Reown
  experimental: {
    optimizePackageImports: ['@reown/appkit', '@reown/appkit-adapter-wagmi'],
  },
};

export default nextConfig;
