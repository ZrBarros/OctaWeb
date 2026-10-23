import type { NextConfig } from "next";

const privateNetworkDevOrigins = [
  "10.*.*.*",
  "192.168.*.*",
  ...Array.from({ length: 16 }, (_, index) => `172.${index + 16}.*.*`),
];

const nextConfig: NextConfig = {
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
