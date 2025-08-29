import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Supabase realtime module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Handle websocket-factory module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      './lib/websocket-factory': require.resolve('@supabase/realtime-js/dist/module/lib/websocket-factory.js'),
    };

    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
  /* config options here */
};

export default nextConfig;
