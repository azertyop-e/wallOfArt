"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArtworkImage } from "@/components/artwork-image";
import type { Artwork } from "@/lib/api";
import {
  FRAME_DURATION,
  HIDE_EASE,
  MASK_HIDDEN,
  MASK_SHOWN,
  REVEAL_EASE,
} from "@/lib/artwork-reveal";
import { gsap, useGSAP } from "@/lib/gsap";

const OVERSCAN = 1.12;

type FavoriteListProps = {
  artworks: Artwork[];
};

export function FavoriteList({ artworks }: FavoriteListProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const layer = useRef(0);
  const current = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const select = gsap.utils.selector(preview);
      const frames = select<HTMLElement>("[data-preview]");
      const frameOf = (id: number | null) =>
        frames.find((frame) => frame.dataset.preview === String(id));

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const next = frameOf(activeId);

      // A frame leaves by raising its bottom edge while its top edge stays
      // where it is, so a reveal cut short closes from where it stopped.
      const topOf = (frame: HTMLElement) =>
        Number(/inset\(([^%\s]+)%/.exec(frame.style.clipPath)?.[1] ?? 100);
      const leaving = frames.filter((frame) => frame !== next);
      const exitOf = (_index: number, frame: HTMLElement) =>
        `inset(${topOf(frame)}% 0% 100% 0%)`;

      current.current?.kill();

      if (next) {
        // The new frame's top edge and the old frames' bottom edges move with
        // the same duration and ease, so the two never overlap.
        const step = {
          duration: reduced ? 0 : FRAME_DURATION * 0.75,
          ease: REVEAL_EASE,
        };
        layer.current += 1;
        gsap.set(next, { zIndex: layer.current });
        current.current = gsap
          .timeline()
          .to(leaving, { clipPath: exitOf, ...step }, 0)
          .fromTo(
            next,
            { clipPath: MASK_HIDDEN },
            { clipPath: MASK_SHOWN, ...step },
            0,
          )
          .fromTo(
            next.querySelector("img"),
            { scale: OVERSCAN },
            {
              scale: 1,
              duration: reduced ? 0 : FRAME_DURATION,
              ease: REVEAL_EASE,
            },
            0,
          );
      } else {
        current.current = gsap.timeline().to(leaving, {
          clipPath: exitOf,
          duration: reduced ? 0 : 0.5,
          ease: HIDE_EASE,
        });
      }
    },
    { scope: preview, dependencies: [activeId] },
  );

  return (
    <div className="mt-6 grid gap-gutter md:grid-cols-2">
      <ul
        onPointerLeave={() => setActiveId(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setActiveId(null);
          }
        }}
        className="border-t border-foreground/10"
      >
        {artworks.map((artwork) => (
          <li
            key={artwork.id}
            data-reveal-item
            className="border-b border-foreground/10"
          >
            <Link
              href={`/paintings/${artwork.slug}`}
              onPointerEnter={() => setActiveId(artwork.id)}
              onFocus={() => setActiveId(artwork.id)}
              className={`grid grid-cols-[1fr_auto] gap-4 py-3 text-xs leading-4 font-medium uppercase transition-colors duration-300 ${
                activeId === null || activeId === artwork.id
                  ? "text-foreground"
                  : "text-muted"
              }`}
            >
              <span>
                {artwork.title}
                {artwork.artist && (
                  <span className="block text-[10px] leading-3 text-muted">
                    {artwork.artist}
                  </span>
                )}
              </span>
              {artwork.year && (
                <span className="text-[10px] leading-3 text-muted">
                  {artwork.year}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-1/2 z-0 right-gutter left-[calc(50%+var(--spacing-gutter)/2)] hidden h-[70svh] -translate-y-1/2 md:block"
      >
        {artworks.map(
          (artwork) =>
            artwork.image && (
              <div
                key={artwork.id}
                data-preview={artwork.id}
                className="absolute inset-0 overflow-hidden [clip-path:inset(100%_0%_0%_0%)]"
              >
                <ArtworkImage
                  src={artwork.image}
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-contain object-left"
                />
              </div>
            ),
        )}
      </div>
    </div>
  );
}
