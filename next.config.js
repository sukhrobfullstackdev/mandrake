/** @type {import('next').NextConfig} */

const path = require('path');

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: process.env.DEPLOY_ENV === 'local',
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['auth.magic.link', 'auth.*.magic.link'],
    },
    instrumentationHook: true,
    optimizePackageImports: ['@magiclabs/ui-components'],
  },
  reactStrictMode: process.env.HOSTNAME !== 'localhost',
  // only run this within the context of a GitHub Action
  // if this is set to true when running next build on Vercel it will publish the source maps which will expose the source code
  // https://nextjs.org/docs/pages/api-reference/next-config-js/productionBrowserSourceMaps
  productionBrowserSourceMaps: process.env.GITHUB_ACTIONS === 'true' || false,
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@styled': path.resolve(__dirname, 'styled-system'),
      '@magiclabs/ui-components/presets': path.resolve(__dirname, '@magiclabs/ui-components/es/presets'),
    };

    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ipfs.io', pathname: '/ipfs/**' },
      { protocol: 'https', hostname: '**.magiclabs.com', pathname: '/logos/**' },
    ],
  },
};

const nextTranslate = require('next-translate-plugin');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: Boolean(process.env.ANALYZE),
});

const withPlugins = require('next-compose-plugins');

module.exports = withPlugins([[withBundleAnalyzer], [nextTranslate]], nextConfig);
