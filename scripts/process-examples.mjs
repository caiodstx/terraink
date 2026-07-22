// Resizes the full 300dpi renders in assets-src/examples/*.png (see
// render-city-posters.mjs) down to web-sized JPEG + WebP in
// public/assets/examples/ — same treatment as the original 3 hand-made
// examples (900px wide, JPEG q85 / WebP q82).
//
// Run: bun run process:examples
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "assets-src", "examples");
const OUT_DIR = join(ROOT, "public", "assets", "examples");
const TARGET_WIDTH = 900;

let count = 0;
for (const file of readdirSync(SRC_DIR)) {
  if (!file.endsWith(".png")) continue;
  const slug = file.replace(/\.png$/, "");
  const inPath = join(SRC_DIR, file);

  await sharp(inPath).resize({ width: TARGET_WIDTH }).jpeg({ quality: 85 }).toFile(join(OUT_DIR, `${slug}.jpg`));
  await sharp(inPath).resize({ width: TARGET_WIDTH }).webp({ quality: 82 }).toFile(join(OUT_DIR, `${slug}.webp`));
  count++;
  console.log(`[${count}] ${slug}`);
}
console.log(`\nProcessed ${count} images.`);
