"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArtworkImage } from "@/components/artwork-image";
import { usePageTransition } from "@/components/providers/page-transition";
import { revealArtworks } from "@/lib/artwork-reveal";
import type { CanvasLayout } from "@/lib/canvas-layout";
import { gsap, useGSAP } from "@/lib/gsap";

const EASE = 0.1;
const MOMENTUM = 14;
const KEY_SPEED = 14;
const DRAG_THRESHOLD = 6;
const MOMENTUM_TIMEOUT = 80;
const WHEEL_IDLE = 150;

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [1, 0],
  ArrowRight: [-1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

const wrap = (value: number, min: number, size: number) =>
  min + ((((value - min) % size) + size) % size);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

type InfiniteCanvasProps = {
  layout: CanvasLayout;
};

export function InfiniteCanvas({ layout }: InfiniteCanvasProps) {
  const root = useRef<HTMLDivElement>(null);
  const plane = useRef<HTMLUListElement>(null);
  const cellProbe = useRef<HTMLDivElement>(null);
  const { onReveal } = usePageTransition();

  useGSAP(
    () => {
      const container = root.current;
      const planeEl = plane.current;
      const probe = cellProbe.current;
      if (!container || !planeEl || !probe) return;

      const items = gsap.utils.toArray<HTMLElement>("[data-canvas-item]");

      let cell = 0;
      let tileWidth = 0;
      let tileHeight = 0;
      let viewWidth = 0;
      let viewHeight = 0;

      const measure = () => {
        cell = probe.offsetWidth;
        tileWidth = layout.columns * cell;
        tileHeight = layout.rows * cell;
        viewWidth = container.clientWidth;
        viewHeight = container.clientHeight;
      };
      measure();

      const camera = {
        x: Math.random() * tileWidth,
        y: Math.random() * tileHeight,
      };
      const target = { ...camera };

      const project = (index: number, offsetX: number, offsetY: number) => {
        const { x, y } = layout.items[index];
        return {
          x: wrap(x * cell + offsetX, (viewWidth - tileWidth) / 2, tileWidth),
          y: wrap(
            y * cell + offsetY,
            (viewHeight - tileHeight) / 2,
            tileHeight,
          ),
        };
      };

      const render = () => {
        items.forEach((item, index) => {
          const position = project(index, camera.x, camera.y);
          item.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
        });
      };
      render();

      const keys = new Set<string>();

      const tick = () => {
        const ratio = gsap.ticker.deltaRatio(60);

        for (const key of keys) {
          target.x += ARROWS[key][0] * KEY_SPEED * ratio;
          target.y += ARROWS[key][1] * KEY_SPEED * ratio;
        }

        const dx = target.x - camera.x;
        const dy = target.y - camera.y;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;

        const ease = 1 - (1 - EASE) ** ratio;
        camera.x += dx * ease;
        camera.y += dy * ease;
        render();
      };
      gsap.ticker.add(tick);

      // Zoom out slightly while the canvas is being moved (drag or wheel).
      let zoomedOut = false;
      const zoomOut = () => {
        if (zoomedOut) return;
        zoomedOut = true;
        gsap.to(planeEl, { scale: 0.96, duration: 0.8, ease: "power3.out" });
      };
      const zoomIn = () => {
        if (!zoomedOut) return;
        zoomedOut = false;
        gsap.to(planeEl, { scale: 1, duration: 0.8, ease: "power3.out" });
      };

      // Drag with inertia. Move/up are listened on window so a drag continues
      // outside the canvas; pointer capture is avoided because it would
      // retarget the click away from the painting links.
      let pointer: {
        id: number;
        startX: number;
        startY: number;
        x: number;
        y: number;
        time: number;
        velocityX: number;
        velocityY: number;
      } | null = null;
      let dragged = false;

      const onPointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;

        pointer = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
          velocityX: 0,
          velocityY: 0,
        };
        dragged = false;
      };

      const onPointerMove = (event: PointerEvent) => {
        if (pointer?.id !== event.pointerId) return;

        const dx = event.clientX - pointer.x;
        const dy = event.clientY - pointer.y;
        const elapsed = Math.max(event.timeStamp - pointer.time, 1);

        // Speed normalized to px per 60fps frame, smoothed over a few events.
        pointer.velocityX =
          pointer.velocityX * 0.6 + (dx / elapsed) * 16.67 * 0.4;
        pointer.velocityY =
          pointer.velocityY * 0.6 + (dy / elapsed) * 16.67 * 0.4;
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.time = event.timeStamp;

        target.x += dx;
        target.y += dy;

        if (
          !dragged &&
          Math.hypot(
            event.clientX - pointer.startX,
            event.clientY - pointer.startY,
          ) > DRAG_THRESHOLD
        ) {
          dragged = true;
          container.dataset.dragging = "";
          zoomOut();
        }
      };

      const onPointerUp = (event: PointerEvent) => {
        if (pointer?.id !== event.pointerId) return;

        if (event.timeStamp - pointer.time < MOMENTUM_TIMEOUT) {
          target.x += pointer.velocityX * MOMENTUM;
          target.y += pointer.velocityY * MOMENTUM;
        }

        pointer = null;
        delete container.dataset.dragging;
        if (wheelTimeout === undefined) zoomIn();
      };

      // A drag ending on a painting must not open it.
      const onClick = (event: MouseEvent) => {
        if (!dragged) return;
        event.preventDefault();
        event.stopPropagation();
        dragged = false;
      };

      // Wheel has no end event: zoom back in once it has been idle a moment.
      let wheelTimeout: ReturnType<typeof setTimeout> | undefined;

      const onWheel = (event: WheelEvent) => {
        // Let the browser handle pinch-to-zoom (ctrl + wheel).
        if (event.ctrlKey) return;
        event.preventDefault();

        zoomOut();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          wheelTimeout = undefined;
          if (!pointer) zoomIn();
        }, WHEEL_IDLE);

        const unit =
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? viewHeight
              : 1;
        target.x -= event.deltaX * unit;
        target.y -= event.deltaY * unit;
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (!(event.key in ARROWS) || isTyping(event.target)) return;
        event.preventDefault();
        keys.add(event.key);
      };

      const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key);
      const onBlur = () => keys.clear();

      // Tabbing to a painting brings it to the center of the screen.
      const onFocusIn = (event: FocusEvent) => {
        const element = event.target as HTMLElement;
        const item = element.closest<HTMLElement>("[data-canvas-item]");
        if (!item || !element.matches(":focus-visible")) return;

        const position = project(items.indexOf(item), target.x, target.y);
        target.x += viewWidth / 2 - position.x;
        target.y += viewHeight / 2 - position.y;
      };

      const resizeObserver = new ResizeObserver(() => {
        measure();
        render();
      });
      resizeObserver.observe(container);

      container.addEventListener("pointerdown", onPointerDown);
      container.addEventListener("click", onClick, true);
      container.addEventListener("wheel", onWheel, { passive: false });
      container.addEventListener("focusin", onFocusIn);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);

      // Entrance: paintings are unmasked one after the other, in random order.
      const entrance = revealArtworks(
        gsap.utils.toArray<HTMLElement>("[data-canvas-reveal]"),
        {
          timeline: gsap.timeline({ paused: true }),
          stagger: { amount: 0.8, from: "random" },
        },
      );
      const stopWaiting = onReveal(() => entrance.play());

      return () => {
        stopWaiting();
        gsap.ticker.remove(tick);
        clearTimeout(wheelTimeout);
        resizeObserver.disconnect();
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("click", onClick, true);
        container.removeEventListener("wheel", onWheel);
        container.removeEventListener("focusin", onFocusIn);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", onBlur);
      };
    },
    // Filtering sends a new layout: tear down listeners and tweens before
    // setting the canvas up again, otherwise they would pile up.
    { scope: root, dependencies: [layout], revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      data-lenis-prevent
      className="fixed inset-0 cursor-grab touch-none overflow-clip overscroll-none select-none data-dragging:cursor-grabbing"
      style={
        {
          "--cell": `max(24vw, calc(100vw / ${layout.columns - 1}), calc(100lvh / ${layout.rows - 1}))`,
        } as React.CSSProperties
      }
    >
      <div
        ref={cellProbe}
        aria-hidden
        className="pointer-events-none absolute h-0 w-(--cell)"
      />

      <ul
        ref={plane}
        aria-label="Paintings in the collection"
        className="size-full"
      >
        {layout.items.map((item) => (
          <li key={item.key} data-canvas-item className="absolute top-0 left-0">
            <Link
              href={`/paintings/${item.slug}`}
              draggable={false}
              className="absolute block -translate-1/2 outline-offset-4"
              style={{ width: `calc(var(--cell) * ${item.width})` }}
            >
              <div data-canvas-reveal>
                <ArtworkImage
                  src={item.image}
                  alt={item.title}
                  width={480}
                  height={600}
                  sizes="(max-aspect-ratio: 1/1) 45vw, 20vw"
                  draggable={false}
                  onLoad={(event) => {
                    event.currentTarget.dataset.loaded = "";
                  }}
                  className="h-auto max-h-[calc(var(--cell)*0.8)] w-full object-contain opacity-0 transition-[opacity,scale] duration-700 ease-out hover:scale-105 data-loaded:opacity-100"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
