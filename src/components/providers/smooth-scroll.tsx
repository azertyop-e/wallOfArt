"use client";

import { type LenisRef, ReactLenis, useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useAppStore } from "@/stores/app-store";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const locked = useAppStore((state) => state.scrollLocks > 0);

  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(update);
  }, []);

  const lenis = useLenis(() => ScrollTrigger.update());

  // The preloader and the page transition hold the scroll while they cover the page.
  useEffect(() => {
    if (!lenis) return;
    if (locked) {
      lenis.stop();
      return;
    }
    lenis.start();
    lenis.resize();
  }, [lenis, locked]);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false }}>
      {children}
    </ReactLenis>
  );
}
