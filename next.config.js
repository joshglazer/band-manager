/** @type {import('next').NextConfig} */
const nextConfig = {
  // set to false due to compatibility issues with react-beautiful-dnd
  reactStrictMode: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
};

module.exports = nextConfig;
