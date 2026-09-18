"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { ArtworkImage } from "@/components/artwork-image";
import {
  FRAME_DURATION,
  hideArtworks,
  MASK_HIDDEN,
  MASK_SHOWN,
  REVEAL_EASE,
  revealArtworks,
  STAGGER,
} from "@/lib/artwork-reveal";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { WALL_IMAGE_ZOOM, WALL_SIZE } from "@/lib/wall";
import { useAppStore } from "@/stores/app-store";

/** Stands in for the home page wall when its paintings could not be fetched. */
const FALLBACK_WALL = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1920px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/2560px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/1920px-1665_Girl_with_a_Pearl_Earring.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/2560px-The_Great_Wave_off_Kanagawa.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/1920px-Gustav_Klimt_016.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/2560px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
];

/** The rest of the ring: paintings that only ever turn, and close before the line. */
const FILLER_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/1920px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/2560px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/1920px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/2560px-Nighthawks_by_Edward_Hopper_1942.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/1920px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg/1920px-Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg",
];

const MASK_GONE = "inset(0% 0% 100% 0%)";
const MIN_DURATION = 4.5;
const WAITING_AT = 90;
const MAX_EXTRA_WAIT = 5;
const LIFT_DURATION = 1.5;

/**
 * Off the home page the ring has no wall to land on, so it sweeps off one side
 * instead: -1 exits to the left, 1 to the right.
 */
const EXIT_DIRECTION = -1;
const EXIT_START = 0.6;
const EXIT_STAGGER = 0.07;
const EXIT_DURATION = 1.2;

const RING_RADIUS_VW = 30;
const RING_RADIUS_VH = 65;
const OVAL_RATIO = 0.42;
const TILT = (-18 * Math.PI) / 180;
const IDLE_SPEED = 0.3;
const BACK_SCALE = 0.72;
const WHEEL_BOOST = 0.004;
const MAX_BOOST = 6;
const BOOST_DECAY = 0.94;

const WALL_FRAMES = "[data-hero-wall] [data-artwork-frame]";

type Box = { x: number; y: number; width: number; height: number };

const ringPoint = (angle: number) => {
  const ovalX = Math.cos(angle);
  const ovalY = Math.sin(angle) * OVAL_RATIO;
  const depth = (Math.sin(angle) + 1) / 2;

  return {
    x: ovalX * Math.cos(TILT) - ovalY * Math.sin(TILT),
    y: ovalX * Math.sin(TILT) + ovalY * Math.cos(TILT),
    scale: BACK_SCALE + depth * (1 - BACK_SCALE),
    zIndex: Math.round(depth * 100),
  };
};

const TURN = Math.PI * 2;
const RING_SIZE = WALL_SIZE + FILLER_IMAGES.length;

const cardAngle = (index: number) => (index / RING_SIZE) * TURN;

const WALL_RING_INDEXES = [6, 8, 4, 10, 2, 0];

type RingCard = {
  src: string;
  slot?: number;
};

const buildRing = (wallImages: string[]): RingCard[] => {
  const wall =
    wallImages.length >= WALL_SIZE
      ? wallImages.slice(0, WALL_SIZE)
      : FALLBACK_WALL;

  const ring: RingCard[] = [];
  wall.forEach((src, slot) => {
    ring[WALL_RING_INDEXES[slot]] = { src, slot };
  });

  let filler = 0;
  for (let index = 0; index < RING_SIZE; index += 1) {
    ring[index] ??= { src: FILLER_IMAGES[filler++] };
  }

  return ring;
};

const restingStyle = (index: number): React.CSSProperties => {
  const { x, y, scale, zIndex } = ringPoint(cardAngle(index));
  const radius = `min(${RING_RADIUS_VW}vw, ${RING_RADIUS_VH}vh)`;

  return {
    transform: `translate(calc(${x.toFixed(4)} * ${radius}), calc(${y.toFixed(4)} * ${radius})) scale(${scale.toFixed(4)})`,
    zIndex,
  };
};

/** Where the home page wall sits on screen, or null when the page has no wall. */
const wallBoxes = (): Box[] | null => {
  const wall = gsap.utils.toArray<HTMLElement>(WALL_FRAMES);
  if (wall.length < WALL_SIZE) return null;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  return wall.slice(0, WALL_SIZE).map((frame) => {
    const rect = frame.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - centerX,
      y: rect.top + rect.height / 2 - centerY,
      width: rect.width,
      height: rect.height,
    };
  });
};

const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") {
      resolve();
      return;
    }
    window.addEventListener("load", () => resolve(), { once: true });
  });

const delay = (seconds: number) =>
  new Promise<void>((resolve) => {
    gsap.delayedCall(seconds, resolve);
  });

type PreloaderProps = {
  wallImages: string[];
};

export function Preloader({ wallImages }: PreloaderProps) {
  const [visible, setVisible] = useState(
    () => useAppStore.getState().isFirstRender,
  );

  if (!visible) return null;

  return (
    <PreloaderScreen
      ring={buildRing(wallImages)}
      onDone={() => setVisible(false)}
    />
  );
}

type PreloaderScreenProps = {
  ring: RingCard[];
  onDone: () => void;
};

function PreloaderScreen({ ring, onDone }: PreloaderScreenProps) {
  const root = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const completeFirstRender = useAppStore((state) => state.completeFirstRender);
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    lenis.stop();
    return () => {
      lenis.start();
      lenis.resize();
    };
  }, [lenis]);

  useGSAP(
    () => {
      gsap.set("[data-preloader-content]", { autoAlpha: 1 });

      const select = gsap.utils.selector(root);
      const cards = select<HTMLElement>("[data-orbit-card]");
      const frames = select<HTMLElement>("[data-artwork-frame]");

      const orbit = { angle: 0, speed: 0 };
      const line = { progress: 0 };
      /** Per card, how far it has slid toward the exit side. */
      const exits = ring.map(() => ({ x: 0 }));
      let boost = 0;
      let radius = 0;

      const cardSlots = ring.map((card) => card.slot);
      const liners = cards.filter((_, index) => cardSlots[index] !== undefined);
      const extras = frames.filter(
        (_, index) => cardSlots[index] === undefined,
      );
      let ringSize = { width: 0, height: 0 };
      let settling = false;

      const measure = () => {
        radius = Math.min(
          (window.innerWidth * RING_RADIUS_VW) / 100,
          (window.innerHeight * RING_RADIUS_VH) / 100,
        );
      };

      const place = () => {
        const boxes = line.progress > 0 ? wallBoxes() : null;
        const toward = gsap.utils.interpolate;

        cards.forEach((card, index) => {
          const point = ringPoint(orbit.angle + cardAngle(index));
          let x = point.x * radius;
          let y = point.y * radius;
          let scale = point.scale;
          let zIndex = point.zIndex;

          const slot = cardSlots[index];
          const box = boxes && slot !== undefined ? boxes[slot] : undefined;
          if (box) {
            x = toward(x, box.x, line.progress);
            y = toward(y, box.y, line.progress);
            scale = toward(scale, 1, line.progress);
            zIndex += 100;
            gsap.set(card.firstElementChild, {
              width: toward(ringSize.width, box.width, line.progress),
              height: toward(ringSize.height, box.height, line.progress),
            });
            gsap.set(card.querySelector("img"), {
              scale: toward(1, WALL_IMAGE_ZOOM, line.progress),
            });
          }

          gsap.set(card, { x: x + exits[index].x, y, scale, zIndex });
        });
      };

      const measureCards = () => {
        const frame = liners[0]?.firstElementChild as HTMLElement | undefined;
        ringSize = {
          width: frame?.offsetWidth ?? 0,
          height: frame?.offsetHeight ?? 0,
        };
      };

      measure();
      window.addEventListener("resize", measure);

      const finish = () => {
        ScrollTrigger.refresh();
        onDone();
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(frames, { clipPath: MASK_SHOWN });

        let cancelled = false;
        pageLoaded().then(() => {
          if (cancelled) return;
          completeFirstRender();
          gsap.to(root.current, {
            autoAlpha: 0,
            duration: 0.4,
            onComplete: finish,
          });
        });
        return () => {
          cancelled = true;
          window.removeEventListener("resize", measure);
        };
      }

      const tick = (_time: number, deltaTime: number) => {
        boost *= BOOST_DECAY ** gsap.ticker.deltaRatio();
        orbit.angle += ((orbit.speed + boost) * deltaTime) / 1000;
        place();
      };
      gsap.ticker.add(tick);

      const onWheel = (event: WheelEvent) => {
        if (settling) return;
        boost = gsap.utils.clamp(
          -MAX_BOOST,
          MAX_BOOST,
          boost + event.deltaY * WHEEL_BOOST,
        );
      };
      window.addEventListener("wheel", onWheel, { passive: true });

      const progress = { value: 0 };
      const render = () => {
        if (counter.current) {
          counter.current.textContent = String(
            Math.round(progress.value),
          ).padStart(3, "0");
        }
      };

      const counted = new Promise<void>((resolve) => {
        const intro = gsap
          .timeline({ defaults: { ease: "expo.out" }, onComplete: resolve })
          .to(
            orbit,
            { speed: IDLE_SPEED, duration: 2.5, ease: "power2.out" },
            0,
          )
          .from(
            "[data-preloader-counter]",
            { yPercent: 110, duration: 1.6 },
            0.2,
          )
          .from(
            "[data-preloader-fade]",
            { autoAlpha: 0, y: 12, duration: 1.4, stagger: 0.15 },
            0.4,
          )
          .to(
            progress,
            {
              value: WAITING_AT,
              duration: MIN_DURATION,
              ease: "power2.inOut",
              onUpdate: render,
            },
            0.2,
          );

        revealArtworks(frames, {
          timeline: intro,
          position: 0.1,
          stagger: { each: 0.1, from: "start" },
        });
      });

      let cancelled = false;

      const loaded = Promise.all([pageLoaded(), document.fonts.ready]);
      const ready = counted.then(() =>
        Promise.race([loaded, delay(MAX_EXTRA_WAIT)]),
      );

      ready.then(() => {
        if (cancelled) return;

        gsap.set(frames, { clipPath: MASK_SHOWN });
        measureCards();

        settling = true;
        boost = 0;

        const timeline = gsap
          .timeline({ onComplete: finish })
          .to(
            progress,
            {
              value: 100,
              duration: 1.4,
              ease: "power2.inOut",
              onUpdate: render,
            },
            0,
          )
          .to(orbit, { speed: 0, duration: 1.8, ease: "power2.out" }, 0);

        /** The shared tail: the counter and the captions leave, then the backdrop lifts. */
        const outro = (at: number) =>
          timeline
            .to(
              "[data-preloader-counter]",
              { yPercent: -110, duration: 0.9, ease: "power3.in" },
              at,
            )
            .to(
              "[data-preloader-fade]",
              { autoAlpha: 0, duration: 0.7, ease: "power2.in" },
              at,
            )
            .addLabel("lift", at + 1)
            .to(
              backdrop.current,
              {
                clipPath: MASK_GONE,
                duration: LIFT_DURATION,
                ease: "expo.inOut",
              },
              "lift",
            )
            .call(completeFirstRender, [], "lift+=0.9");

        // On the home page the ring lines up on the wall and hands its paintings
        // over to the very same ones underneath.
        if (wallBoxes()) {
          const lineFrames = cards
            .map((card, index) => ({ card, slot: cardSlots[index] }))
            .filter(({ slot }) => slot !== undefined)
            .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
            .map(({ card }) => card.firstElementChild as HTMLElement);

          timeline
            .add(
              hideArtworks(extras, {
                duration: 0.7,
                stagger: { each: 0.08, from: "random" },
              }),
              0,
            )
            .to(line, { progress: 1, duration: 2.2, ease: "expo.inOut" }, 0.2);

          outro(1.4).fromTo(
            lineFrames,
            { clipPath: MASK_SHOWN },
            {
              clipPath: MASK_GONE,
              duration: FRAME_DURATION,
              ease: REVEAL_EASE,
              stagger: STAGGER.fromCenter,
            },
            "lift+=1.2",
          );

          return;
        }

        // Anywhere else there is no wall to land on: the whole ring slides off the
        // same side, the cards nearest that edge leaving first.
        const distance =
          EXIT_DIRECTION * (window.innerWidth / 2 + radius + ringSize.width);

        exits
          .map((exit, index) => ({
            exit,
            x: ringPoint(orbit.angle + cardAngle(index)).x,
          }))
          .sort((a, b) => (b.x - a.x) * EXIT_DIRECTION)
          .forEach(({ exit }, rank) => {
            timeline.to(
              exit,
              { x: distance, duration: EXIT_DURATION, ease: "power2.in" },
              EXIT_START + rank * EXIT_STAGGER,
            );
          });

        // The backdrop only lifts once the last card has cleared the edge.
        outro(
          EXIT_START + (exits.length - 1) * EXIT_STAGGER + EXIT_DURATION - 1,
        );
      });

      return () => {
        cancelled = true;
        gsap.ticker.remove(tick);
        window.removeEventListener("resize", measure);
        window.removeEventListener("wheel", onWheel);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} data-preloader aria-hidden className="fixed inset-0 z-40">
      <noscript>
        <style>{"[data-preloader]{display:none}"}</style>
      </noscript>

      <div ref={backdrop} className="absolute inset-0 bg-foreground" />

      <ul className="absolute inset-0 isolate">
        {ring.map(({ src }, index) => (
          <li
            key={src}
            data-orbit-card
            style={restingStyle(index)}
            className="absolute top-1/2 left-1/2 size-0 will-change-transform"
          >
            <div
              data-artwork-frame
              style={{ clipPath: MASK_HIDDEN }}
              className="absolute aspect-3/4 w-[clamp(6.5rem,13vw,15rem)] -translate-x-1/2 -translate-y-1/2 overflow-clip"
            >
              <ArtworkImage
                src={src}
                alt=""
                fill
                preload
                sizes="(min-width: 115rem) 15rem, 13vw"
                className="object-cover"
              />
            </div>
          </li>
        ))}
      </ul>

      <div
        data-preloader-content
        className="invisible absolute inset-0 z-10 flex items-center justify-center text-background"
      >
        <span className="flex overflow-clip text-[clamp(1.5rem,3vw,3.5rem)] leading-none font-medium tabular-nums">
          <span ref={counter} data-preloader-counter className="inline-block">
            000
          </span>
        </span>
      </div>

      <div
        data-preloader-content
        className="invisible absolute inset-x-0 bottom-0 z-10 grid grid-cols-2 items-end gap-gutter p-gutter text-[10px] leading-3 font-medium text-background uppercase"
      >
        <p data-preloader-fade>
          A museum of painting
          <br />
          <span className="text-muted">Opening the doors</span>
        </p>
        <p data-preloader-fade className="justify-self-end text-right">
          Loading
          <br />
          <span className="text-muted">the collection</span>
        </p>
      </div>
    </div>
  );
}
