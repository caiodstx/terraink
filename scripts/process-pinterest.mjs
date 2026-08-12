// Resizes the full 300dpi renders in assets-src/pinterest/*.png (see
// render-pinterest-posters.mjs) down to Pinterest-ready JPEGs, and stamps
// a folded-corner watermark over the bottom-right corner first — a
// deliberate visual interruption (not just a faint logo overlay) so the
// image can't be lifted and used as a clean, full-bleed poster file even
// at low resolution. Same technique other map-poster sites use for their
// social previews. Never applied to anything under public/assets/ (the
// real product photos/catalog feed) — this is a separate, marketing-only
// export, output stays out of the repo and out of the site entirely.
//
// Run: bun run process:pinterest
import sharp from "sharp";
import { readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "assets-src", "pinterest");
const OUT_DIR = join(ROOT, "assets-src", "pinterest-final");
const TARGET_WIDTH = 1000;
const FOLD_RATIO = 0.17; // fold leg length as a fraction of the resized width

mkdirSync(OUT_DIR, { recursive: true });

function foldSvg(w, h) {
  const s = Math.round(w * FOLD_RATIO);
  return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="foldShadow" x="-100%" y="-100%" width="300%" height="300%">
      <feDropShadow dx="${-s * 0.05}" dy="${-s * 0.05}" stdDeviation="${s * 0.08}" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <linearGradient id="flapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f6f2e9"/>
      <stop offset="45%" stop-color="#e6ded0"/>
      <stop offset="100%" stop-color="#c9bfa8"/>
    </linearGradient>
    <linearGradient id="creaseGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="50%" stop-color="#000000" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <polygon points="${w - s},${h} ${w},${h} ${w},${h - s}" fill="#000000" filter="url(#foldShadow)"/>
  <polygon points="${w - s},${h} ${w},${h} ${w},${h - s}" fill="url(#flapGrad)"/>
  <line x1="${w - s}" y1="${h}" x2="${w}" y2="${h - s}" stroke="url(#creaseGrad)" stroke-width="${s * 0.05}"/>
  <text
    x="${w - s * 0.32}" y="${h - s * 0.32}"
    font-family="Arial, sans-serif" font-size="${s * 0.085}" font-weight="700"
    fill="#5b5344" fill-opacity="0.75" letter-spacing="${s * 0.006}"
    text-anchor="middle"
    transform="rotate(45 ${w - s * 0.32} ${h - s * 0.32})"
  >MAPAGRAMA.COM</text>
</svg>`;
}

let count = 0;
for (const file of readdirSync(SRC_DIR)) {
  if (!file.endsWith(".png")) continue;
  const slug = file.replace(/\.png$/, "");
  const inPath = join(SRC_DIR, file);

  // sharp's .metadata() on a pipeline reflects the *input* image, not a
  // still-pending .resize() — compute the real output size ourselves so
  // the SVG overlay matches exactly, or sharp rejects the composite as
  // "must have same dimensions or smaller".
  const srcMeta = await sharp(inPath).metadata();
  const targetHeight = Math.round((srcMeta.height / srcMeta.width) * TARGET_WIDTH);
  const svg = foldSvg(TARGET_WIDTH, targetHeight);

  await sharp(inPath)
    .resize({ width: TARGET_WIDTH, height: targetHeight })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toFile(join(OUT_DIR, `${slug}.jpg`));

  count++;
  console.log(`[${count}] ${slug}`);
}
console.log(`\nProcessed ${count} images -> ${OUT_DIR}`);
