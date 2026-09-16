import type { NextConfig } from "next";
import { WIKIMEDIA_THUMBNAIL_WIDTHS } from "./src/lib/wikimedia";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  images: {
    // Artwork images never change behind a given URL: keep optimized copies for
    // 31 days instead of 4 hours to avoid re-downloading them from the hosts.
    minimumCacheTTL: 2678400,
    // srcset widths = the thumbnail widths Wikimedia serves, so every srcset
    // candidate is a distinct file whose `w` descriptor matches its real width.
    imageSizes: WIKIMEDIA_THUMBNAIL_WIDTHS.filter((width) => width < 500),
    deviceSizes: WIKIMEDIA_THUMBNAIL_WIDTHS.filter((width) => width >= 500),
    // Hosts serving the artwork images returned by the museum API.
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "www.metmuseum.org" },
      { protocol: "https", hostname: "www.moma.org" },
    ],
  },
};

export default nextConfig;
