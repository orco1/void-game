import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/game",
        destination: "/game/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
