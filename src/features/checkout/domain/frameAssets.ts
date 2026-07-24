import type { FrameColor } from "./types";

// Single source of truth for the frame assets. Real product photography
// (transparent PNGs, background keyed out) used via border-image in
// PosterFramePreview.tsx — swap these files (same portrait aspect ratio)
// to update the look without touching any component code.
export const FRAME_TEXTURE_URL: Record<FrameColor, string> = {
  "natural-wood": "/assets/frames/natural-wood.png",
  black: "/assets/frames/black.png",
  gold: "/assets/frames/gold.png",
};

// Square corner-detail crops (real photography, already on a dark navy
// background matching the app's palette) used as FrameColorCard's swatch.
export const FRAME_SELECTOR_URL: Record<FrameColor, string> = {
  "natural-wood": "/assets/frame-selectors/natural-wood.jpg",
  black: "/assets/frame-selectors/black.jpg",
  gold: "/assets/frame-selectors/gold.jpg",
};

// Fixed room backdrop for the "vista en pared" preview mode.
export const WALL_MOCKUP_URL = "/assets/mockups/wall.jpg";

export const FRAME_COLOR_LABEL: Record<FrameColor, string> = {
  "natural-wood": "Madera natural",
  black: "Negro",
  gold: "Dorado",
};

export const FRAME_COLOR_TAGLINE: Record<FrameColor, string> = {
  "natural-wood": "Cálida y elegante",
  black: "Moderno y sofisticado",
  gold: "Exclusivo y brillante",
};
