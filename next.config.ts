import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Polyfill configuration only needed for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Provide polyfills for Node.js core modules
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        http: require.resolve('http-browserify'),
        https: require.resolve('https-browserify'),
        url: false, // Let's keep URL using the browser's native URL API
      };

      // Add buffer to providePlugin
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Add process to providePlugin
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
        })
      );
    }
    return config;
  },
};

export default nextConfig;