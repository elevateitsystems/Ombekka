import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  env: {
    // Expose the proxy URL to the client via a separate variable
    // so server-side code can still use the real BACKEND_URL from .env
    NEXT_PUBLIC_PROXY_URL: "/proxy-api",
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
