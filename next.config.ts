import type { NextConfig } from "next";
import { sources } from "next/dist/compiled/webpack/webpack";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/reports",
        permanent: true, // true = 308, false = 307
      },
    ];
  },
};

export default nextConfig;
