import type { NextConfig } from "next";
import { WIKIMEDIA_THUMBNAIL_WIDTHS } from "./src/lib/wikimedia";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  images: {
    minimumCacheTTL: 2678400,
    imageSizes: WIKIMEDIA_THUMBNAIL_WIDTHS.filter((width) => width < 500),
    deviceSizes: WIKIMEDIA_THUMBNAIL_WIDTHS.filter((width) => width >= 500),
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "www.metmuseum.org" },
      { protocol: "https", hostname: "www.moma.org" },
    ],
  },
};

export default nextConfig;
