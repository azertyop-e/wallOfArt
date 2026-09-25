import { ImageResponse } from "next/og";
import { getArtworks } from "@/lib/api";
import { SITE_NAME } from "@/lib/site";
import { pickWall, WALL_SIZE } from "@/lib/wall";
import { getWikimediaThumbnail } from "@/lib/wikimedia";

export const alt = `${SITE_NAME}, a museum of painting`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PADDING = 48;
const GAP = 24;
const IMAGE_HEIGHT = 260;
const IMAGE_WIDTH = Math.floor(
  (size.width - PADDING * 2 - GAP * (WALL_SIZE - 1)) / WALL_SIZE,
);

export const revalidate = 3600;

async function loadImage(src: string) {
  const res = await fetch(getWikimediaThumbnail(src, 330), {
    headers: { "User-Agent": `${SITE_NAME} (Open Graph image)` },
  });
  if (!res.ok) throw new Error(`Failed to load ${src} (${res.status})`);

  const type = res.headers.get("content-type") ?? "image/jpeg";
  const data = Buffer.from(await res.arrayBuffer()).toString("base64");
  return `data:${type};base64,${data}`;
}

async function getWallImages() {
  try {
    const wall = pickWall(await getArtworks());
    const images = await Promise.allSettled(
      wall.map((artwork) => loadImage(artwork.image)),
    );
    return images.flatMap((image) =>
      image.status === "fulfilled" ? [image.value] : [],
    );
  } catch {
    return [];
  }
}

export default async function Image() {
  const images = await getWallImages();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: PADDING,
        background: "white",
        color: "black",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          fontWeight: 500,
          textTransform: "uppercase",
        }}
      >
        <span>{SITE_NAME}</span>
        <span style={{ color: "#828282" }}>Museum of painting</span>
      </div>

      {images.length > 0 && (
        <div style={{ display: "flex", gap: GAP }}>
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              style={{ objectFit: "cover" }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          fontSize: 132,
          fontWeight: 500,
          lineHeight: 0.9,
          letterSpacing: -4,
          textTransform: "uppercase",
        }}
      >
        {SITE_NAME}
      </div>
    </div>,
    size,
  );
}
