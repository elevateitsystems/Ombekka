import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Expose the proxy URL to the client instead of the real Render URL
    BACKEND_URL: "/proxy-api",
  },
  async rewrites() {
    return [
      {
        // Proxy all requests starting with /proxy-api to the Render backend
        source: "/proxy-api/:path*",
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
