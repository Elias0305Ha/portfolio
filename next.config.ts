import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project images may be local (/public) or hosted. Screenshots are wide,
    // so the small end of the default size list is never useful here.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    imageSizes: [64, 96, 128, 256, 384],
  },
};

export default nextConfig;
