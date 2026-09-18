"use client";

import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type RefObject,
  use,
  useEffect,
  useEffectEvent,
  useRef,
} from "react";
import { WallTitle } from "@/components/wall-title";
import { MASK_HIDDEN, MASK_SHOWN } from "@/lib/artwork-reveal";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useAppStore } from "@/stores/app-store";

const MASK_GONE = "inset(0% 0% 100% 0%)";
const LEAVE_DURATION = 0.9;
const ENTER_DURATION = 1.1;
const TITLE_IN_AT = 0.4;
const LIFT_AT = 0.3;
const DRIFT = "12vh";

type PageTransitionContextValue = {
  navigate: (href: string) => void;
  onReveal: (callback: () => void) => () => void;
  content: RefObject<HTMLDivElement | null>;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

export function usePageTransition() {
  const context = use(PageTransitionContext);
  if (!context) {
    throw new Error("usePageTransition must be used inside <PageTransition>");
  }
  return context;
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The internal link a click should navigate through, if the transition may take it over. */
const transitionLinkOf = (event: MouseEvent) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const link =
    event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (
    !(link instanceof HTMLAnchorElement) ||
    (link.target && link.target !== "_self") ||
    link.hasAttribute("download")
  ) {
    return null;
  }

  const url = new URL(link.href);
  return url.origin === window.location.origin ? url : null;
};

const titleCharsOf = (curtain: HTMLElement | null) =>
  gsap.utils.toArray<HTMLElement>(
    curtain?.querySelectorAll("[data-title-char]") ?? [],
  );

/**
 * Wraps the app and plays the page transition on every internal link click, so
 * pages keep using a plain `next/link`. `navigate` does the same from code.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  const curtain = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  /** The pathname being left while a transition runs, null otherwise. */
  const leaving = useRef<string | null>(null);
  const leave = useRef<gsap.core.Timeline>(null);
  const covered = useRef(useAppStore.getState().isFirstRender);
  const waiting = useRef(new Set<() => void>());

  const uncover = () => {
    covered.current = false;
    const callbacks = [...waiting.current];
    waiting.current.clear();
    for (const callback of callbacks) callback();
  };

  const onUncover = useEffectEvent(uncover);

  useEffect(
    () =>
      useAppStore.subscribe((state) => {
        if (!state.isFirstRender) onUncover();
      }),
    [],
  );

  const onReveal = (callback: () => void) => {
    if (!covered.current) {
      callback();
      return () => {};
    }

    waiting.current.add(callback);
    return () => {
      waiting.current.delete(callback);
    };
  };

  const navigate = (href: string) => {
    if (leaving.current !== null) return;

    const { pathname: destination } = new URL(href, window.location.href);
    if (destination === pathname || prefersReducedMotion()) {
      router.push(href);
      return;
    }

    leaving.current = pathname;
    covered.current = true;
    router.prefetch(href);

    leave.current = gsap
      .timeline({ defaults: { duration: LEAVE_DURATION, ease: "expo.inOut" } })
      .fromTo(
        curtain.current,
        { clipPath: MASK_HIDDEN },
        { clipPath: MASK_SHOWN },
        0,
      )
      .to(content.current, { y: `-${DRIFT}` }, 0)
      .fromTo(
        titleCharsOf(curtain.current),
        { yPercent: 110 },
        { yPercent: 0, ease: "expo.out", stagger: 0.04 },
        TITLE_IN_AT,
      )
      // Navigate as soon as the page is hidden: the new one loads while the title slides in.
      .call(() => router.push(href, { scroll: false }), [], LEAVE_DURATION);
  };

  const onLinkClick = useEffectEvent((event: MouseEvent) => {
    const url = transitionLinkOf(event);
    if (!url || url.pathname === pathname || prefersReducedMotion()) return;

    // Stops `next/link` from navigating right away: it bails out on a prevented click.
    event.preventDefault();
    navigate(`${url.pathname}${url.search}${url.hash}`);
  });

  // Listened on <body>, which a click reaches before React's root listener on
  // the document, and which also contains portals.
  useEffect(() => {
    const listener = (event: MouseEvent) => onLinkClick(event);
    document.body.addEventListener("click", listener);
    return () => document.body.removeEventListener("click", listener);
  }, []);

  // The new page is committed once the pathname changes: reveal it.
  useEffect(() => {
    if (leaving.current === null || leaving.current === pathname) return;
    leaving.current = null;

    lenis?.scrollTo(0, { immediate: true, force: true });

    // Let the title finish sliding in if the new page was quick to load.
    const title = leave.current;
    const delay = title ? title.duration() - title.time() : 0;

    gsap
      .timeline({
        delay,
        defaults: { duration: ENTER_DURATION, ease: "expo.inOut" },
        onComplete: () => {
          lenis?.resize();
          ScrollTrigger.refresh();
        },
      })
      .to(
        titleCharsOf(curtain.current),
        { yPercent: -110, duration: 0.6, ease: "power3.in", stagger: 0.03 },
        0,
      )
      .fromTo(
        curtain.current,
        { clipPath: MASK_SHOWN },
        { clipPath: MASK_GONE },
        LIFT_AT,
      )
      .call(() => onUncover(), [], LIFT_AT)
      .fromTo(
        content.current,
        { y: DRIFT },
        { y: 0, ease: "expo.out", clearProps: "transform" },
        LIFT_AT + 0.2,
      );
  }, [pathname, lenis]);

  return (
    <PageTransitionContext value={{ navigate, onReveal, content }}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-end bg-foreground p-gutter text-background [clip-path:inset(100%_0%_0%_0%)]"
      >
        <WallTitle />
      </div>
    </PageTransitionContext>
  );
}

/** Wraps the routed pages: the part of the layout that drifts during a transition. */
export function PageTransitionContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { content } = usePageTransition();

  return <div ref={content}>{children}</div>;
}
