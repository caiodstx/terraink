import type { FrameColor, PosterKind } from "./types";

// Mirrors mapagrama-api/src/catalog.ts's key scheme (poster-{size} /
// framed-{size}-{frameColor}). Kept in sync by hand — no shared package
// crosses the AGPL (this repo) / private (mapagrama-api) boundary.
const LAYOUT_ID_TO_SIZE: Record<string, string> = {
  poster_30x40: "30x40",
  poster_50x70: "50x70",
};

export function sizeFromLayoutId(layoutId: string): string | null {
  return LAYOUT_ID_TO_SIZE[layoutId] ?? null;
}

export function resolveVariantId(
  layoutId: string,
  kind: PosterKind,
  frameColor: FrameColor | null,
): string | null {
  const size = sizeFromLayoutId(layoutId);
  if (!size) return null;
  if (kind === "poster") return `poster-${size}`;
  if (!frameColor) return null;
  return `framed-${size}-${frameColor}`;
}
