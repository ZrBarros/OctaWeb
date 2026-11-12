import type { NextConfig } from "next";

const privateNetworkDevOrigins = [
  "10.*.*.*",
  "192.168.*.*",
  ...Array.from({ length: 16 }, (_, index) => `172.${index + 16}.*.*`),
];

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL ?? "http://localhost:3333/api/v1";
    return [
      { source: "/api/v1/:path*", destination: `${apiUrl}/:path*` },
      { source: "/uploads/:path*", destination: `${apiUrl.replace(/\/api\/v1\/?$/, "")}/uploads/:path*` },
    ];
  },
  // Let phones and tablets on a private Wi-Fi network load Next dev assets.
  allowedDevOrigins: privateNetworkDevOrigins,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3333", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
