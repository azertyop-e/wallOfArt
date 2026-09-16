import type { Artwork } from "@/lib/api";

const MIN_COLUMNS = 6;
const MIN_ROWS = 5;
const FILL_RATIO = 0.8;

export type CanvasItem = {
  key: string;
  slug: string;
  title: string;
  image: string;
  x: number;
  y: number;
  width: number;
};

export type CanvasLayout = {
  columns: number;
  rows: number;
  items: CanvasItem[];
};

function shuffle<T>(array: T[], random: () => number) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const between = (random: () => number, min: number, max: number) =>
  min + random() * (max - min);

export function createCanvasLayout(
  artworks: Artwork[],
  random: () => number = Math.random,
): CanvasLayout {
  const withImage = artworks.filter(
    (artwork): artwork is Artwork & { image: string } => Boolean(artwork.image),
  );

  const columns = Math.max(
    MIN_COLUMNS,
    Math.ceil(Math.sqrt(withImage.length * 1.25)),
  );
  const rows = Math.max(MIN_ROWS, Math.ceil(withImage.length / columns));
  const cells = shuffle(
    Array.from({ length: columns * rows }, (_, index) => index),
    random,
  );

  const count =
    withImage.length === 0
      ? 0
      : Math.min(
          cells.length,
          Math.max(withImage.length, Math.ceil(cells.length * FILL_RATIO)),
        );

  const paintings: typeof withImage = [];
  while (paintings.length < count) {
    paintings.push(...shuffle(withImage, random));
  }

  const items = paintings.slice(0, count).map((artwork, index) => {
    const column = cells[index] % columns;
    const row = Math.floor(cells[index] / columns);

    return {
      key: `${artwork.slug}-${index}`,
      slug: artwork.slug,
      title: artwork.title,
      image: artwork.image,
      x: column + 0.5 + between(random, -0.1, 0.1),
      y: row + 0.5 + (column % 2) * 0.5 + between(random, -0.1, 0.1),
      width: between(random, 0.55, 0.8),
    };
  });

  return { columns, rows, items };
}
