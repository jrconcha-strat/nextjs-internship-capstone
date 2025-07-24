import type { NextConfig } from 'next';
 
const nextConfig: NextConfig = {
  images:{
    remotePatterns: [new URL("https://img.clerk.com/*")]
  }
  /* config options here */
}
 
export default nextConfig