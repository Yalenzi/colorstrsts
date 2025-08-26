/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration for maximum compatibility
  images: {
    unoptimized: true,
  },


  // Static export for Netlify
  output: 'export',
  trailingSlash: true,
  distDir: 'out',

  // Disable type checking and linting for build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Add webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
