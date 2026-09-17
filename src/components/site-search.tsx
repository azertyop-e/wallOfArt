"use client";

import { useLenis } from "lenis/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArtworkCard } from "@/components/artwork-card";
import { usePageTransition } from "@/components/providers/page-transition";
import type { Artwork } from "@/lib/api";
import {
  HIDE_EASE,
  hideArtworks,
  MASK_HIDDEN,
  MASK_SHOWN,
  REVEAL_EASE,
  revealArtworks,
  STAGGER,
} from "@/lib/artwork-reveal";
import { gsap, useGSAP } from "@/lib/gsap";
import type { SearchResponse } from "@/lib/search";

const MIN_QUERY = 3;
const DEBOUNCE = 180;
const NO_RESULTS: Artwork[] = [];

const rowsOf = (list: HTMLElement | null) =>
  gsap.utils.toArray<HTMLElement>(list?.children ?? []);

const partsOf = (rows: HTMLElement[], selector: string) =>
  rows.flatMap((row) => {
    const part = row.querySelector<HTMLElement>(selector);
    return part ? [part] : [];
  });

const targetsOf = (rows: HTMLElement[]) =>
  rows.flatMap((row) => [
    row,
    ...gsap.utils.toArray<HTMLElement>(row.querySelectorAll("*")),
  ]);

const slugOf = (row: HTMLElement) => row.dataset.slug ?? "";

const settle = (rows: HTMLElement[]) => {
  if (rows.length === 0) return;

  gsap.killTweensOf(targetsOf(rows));

  const back = { duration: 0.35, ease: REVEAL_EASE };
  gsap.to(partsOf(rows, "[data-artwork-frame]"), {
    ...back,
    clipPath: MASK_SHOWN,
    clearProps: "clipPath",
  });
  gsap.to(partsOf(rows, "img"), { ...back, scale: 1, clearProps: "scale" });
  gsap.to(partsOf(rows, "[data-artwork-caption]"), {
    ...back,
    autoAlpha: 1,
    y: 0,
    clearProps: "opacity,visibility,transform",
  });
};

export function SiteSearch({ className }: { className?: string }) {
  const { navigate } = usePageTransition();
  const lenis = useLenis();

  const field = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const counter = useRef({ value: 0 });
  const previousCount = useRef(0);

  const revealed = useRef(new Set<string>());
  const leaving = useRef<{
    timeline: gsap.core.Timeline;
    rows: HTMLElement[];
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(NO_RESULTS);
  const [displayed, setDisplayed] = useState(NO_RESULTS);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const panelId = useId();
  const term = query.trim();
  const searchable = term.length >= MIN_QUERY;
  const expanded = searchable && !dismissed;

  const found = `artwork${displayed.length > 1 ? "s" : ""} found`;
  const summary =
    displayed.length > 0
      ? `${displayed.length} ${found}`
      : loading
        ? ""
        : `No artwork matches “${term}”`;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!searchable) {
      setResults(NO_RESULTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Search failed (${response.status})`);

        const data: SearchResponse = await response.json();
        setResults(data.results.length > 0 ? data.results : NO_RESULTS);
        setLoading(false);
      } catch {
        if (controller.signal.aborted) return;
        setResults(NO_RESULTS);
        setLoading(false);
      }
    }, DEBOUNCE);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [term, searchable]);

  useEffect(() => {
    if (!expanded) return;

    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (field.current?.contains(target) || panel.current?.contains(target))
        return;
      setDismissed(true);
    };

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDismissed(true);
      input.current?.focus();
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [expanded, lenis]);

  useGSAP(() => {
    gsap.to(panel.current, {
      overwrite: true,
      clipPath: expanded ? MASK_SHOWN : MASK_HIDDEN,
      duration: expanded ? 1.1 : 0.4,
      ease: expanded ? REVEAL_EASE : HIDE_EASE,
    });
  }, [expanded]);

  useGSAP(() => {
    if (results === displayed) return;

    const rows = rowsOf(list.current);
    const kept = new Set(results.map((artwork) => artwork.slug));

    const pending = leaving.current;
    leaving.current = null;
    if (pending) {
      pending.timeline.kill();
      settle(pending.rows.filter((row) => kept.has(slugOf(row))));
    }

    const going = rows.filter((row) => !kept.has(slugOf(row)));
    if (going.length === 0) {
      setDisplayed(results);
      return;
    }

    gsap.killTweensOf(targetsOf(going));

    const timeline = hideArtworks(partsOf(going, "[data-artwork-frame]"), {
      stagger: STAGGER.toLeft,
      onComplete: () => {
        leaving.current = null;
        setDisplayed(results);
      },
    }).to(
      partsOf(going, "[data-artwork-caption]"),
      {
        autoAlpha: 0,
        y: 12,
        duration: 0.25,
        ease: HIDE_EASE,
        stagger: STAGGER.toLeft,
      },
      0,
    );

    leaving.current = { timeline, rows: going };
  }, [results, displayed]);

  useGSAP(() => {
    const rows = rowsOf(list.current);
    const entering = rows.filter((row) => !revealed.current.has(slugOf(row)));
    revealed.current = new Set(rows.map(slugOf));

    if (entering.length === 0) return;

    revealArtworks(partsOf(entering, "[data-artwork-frame]"), {
      stagger: STAGGER.fromLeft,
    }).fromTo(
      partsOf(entering, "[data-artwork-caption]"),
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        ease: REVEAL_EASE,
        stagger: STAGGER.fromLeft,
        clearProps: "opacity,visibility,transform",
      },
      0.3,
    );
  }, [displayed]);

  useGSAP(() => {
    const target = displayed.length;
    const from = counter.current;
    const draw = (value: number) => {
      if (count.current) count.current.textContent = String(value);
    };

    if (previousCount.current === 0 || target === 0) {
      gsap.killTweensOf(from);
      from.value = target;
      draw(target);
    } else {
      const round = target > from.value ? Math.ceil : Math.floor;
      draw(round(from.value));
      gsap.to(from, {
        value: target,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => draw(round(from.value)),
      });
    }

    previousCount.current = target;
  }, [displayed.length]);

  const clear = () => {
    setQuery("");
    setDismissed(false);
  };

  const moveFocus = (event: React.KeyboardEvent, step: number) => {
    const links = partsOf(rowsOf(list.current), "a");
    if (links.length === 0) return;

    const current = links.indexOf(document.activeElement as HTMLElement);
    if (current === -1 && step < 0) return;

    event.preventDefault();
    const next = links[Math.min(Math.max(current + step, 0), links.length - 1)];

    if (current === 0 && step < 0) input.current?.focus();
    else next?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      moveFocus(event, -1);
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      moveFocus(event, 1);
  };

  return (
    <>
      <search ref={field} className={`relative ${className ?? ""}`}>
        <form
          className="flex items-center gap-2 border-b border-current/40 pb-1 transition-colors duration-300 focus-within:border-current"
          onSubmit={(event) => {
            event.preventDefault();
            const first = displayed[0];
            if (!first) return;
            clear();
            navigate(`/paintings/${first.slug}`);
          }}
        >
          <label htmlFor={`${panelId}-input`} className="sr-only">
            Search
          </label>
          <input
            ref={input}
            id={`${panelId}-input`}
            type="search"
            value={query}
            placeholder="Search"
            autoComplete="off"
            aria-controls={panelId}
            onChange={(event) => {
              setQuery(event.target.value);
              setDismissed(false);
            }}
            onFocus={() => setDismissed(false)}
            onKeyDown={onKeyDown}
            className="w-32 bg-transparent uppercase caret-current outline-none placeholder:text-muted md:w-48 [&::-webkit-search-cancel-button]:hidden"
          />
        </form>
      </search>

      {mounted &&
        createPortal(
          <div
            ref={panel}
            id={panelId}
            aria-hidden={!expanded}
            inert={!expanded}
            className={`fixed inset-x-0 bottom-0 z-40 [clip-path:inset(100%_0%_0%_0%)] border-t border-foreground/10 bg-background px-gutter pt-gutter pb-page-bottom ${
              expanded ? "" : "pointer-events-none"
            }`}
          >
            <ul
              ref={list}
              onKeyDown={onKeyDown}
              aria-label="Search results"
              className="grid grid-cols-3 gap-gutter md:grid-cols-6"
            >
              {displayed.map((artwork) => (
                <li key={artwork.slug} data-slug={artwork.slug}>
                  <ArtworkCard
                    artwork={artwork}
                    sizes="(min-width: 768px) 15vw, 30vw"
                    onSelect={clear}
                  />
                </li>
              ))}
            </ul>

            <p className="mt-gutter min-h-3 text-[10px] leading-3 font-medium text-muted uppercase">
              <span className="sr-only" aria-live="polite">
                {summary}
              </span>
              <span aria-hidden>
                {displayed.length > 0 ? (
                  <>
                    <span ref={count} className="tabular-nums" />
                    {` ${found}`}
                  </>
                ) : (
                  summary
                )}
              </span>
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
