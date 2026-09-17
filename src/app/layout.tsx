import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Navbar } from "@/components/navBar";
import {
  PageTransition,
  PageTransitionContent,
} from "@/components/providers/page-transition";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

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
  title: "Museum",
  description: "A creative museum to explore by scrolling.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        </PageTransition>
      </body>
    </html>
  );
}
