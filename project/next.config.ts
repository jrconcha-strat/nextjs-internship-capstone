import type { NextConfig } from 'next';
 
const nextConfig: NextConfig = {
  images:{
    remotePatterns: [new URL("https://img.clerk.com/*")]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
 
export default nextConfig