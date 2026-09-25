import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Navbar } from "@/components/navBar";
import { Preloader } from "@/components/preloader";
import {
  PageTransition,
  PageTransitionContent,
} from "@/components/providers/page-transition";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { getArtworks } from "@/lib/api";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { pickWall } from "@/lib/wall";

const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-Regular.woff2", weight: "400" },
    { path: "./fonts/ClashDisplay-Medium.woff2", weight: "500" },
  ],
  variable: "--font-clash-display",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: `${SITE_NAME} — Museum of painting`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

async function getWallImages() {
  try {
    return pickWall(await getArtworks()).map((artwork) => artwork.image);
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const wallImages = await getWallImages();

  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <PageTransition>
          <Navbar />
          <SmoothScroll>
            <PageTransitionContent>{children}</PageTransitionContent>
          </SmoothScroll>
          <Preloader wallImages={wallImages} />
        </PageTransition>
      </body>
    </html>
  );
}
