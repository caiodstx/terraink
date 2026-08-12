// Batch-renders one poster per city in src/data/cities.ts for Pinterest
// content — each city rotates through the 8 curated styles in
// src/data/styles.ts (city index mod 8) so the board shows real
// personalization variety instead of 71 identical Midnight Blue images.
// Same real render pipeline as render-city-posters.mjs / render-style-
// examples.mjs (window.mapagramaExportFullAsync via DevExportBridge.tsx,
// dev-only, never present in prod) — not a mockup, the actual map engine.
//
// Requires `bun run dev` running locally first.
// Run: bun run render:pinterest
//
// Output: assets-src/pinterest/<slug>.png (gitignored, full 300dpi
// originals). Run `bun run process:pinterest` afterwards to resize and
// apply the corner-fold watermark before these ever leave the machine —
// the raw renders here are never meant to be uploaded as-is.
import puppeteer from "puppeteer-core";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { CITIES } from "../src/data/cities.ts";
import { STYLES } from "../src/data/styles.ts";

const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT_DIR = new URL("../assets-src/pinterest/", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");
const DEV_SERVER = process.env.DEV_SERVER_URL ?? "http://localhost:5173";

// Optional: `bun run render:pinterest -- 3` renders only the first N
// cities — useful to sanity-check the pipeline before committing to all 71.
const LIMIT = Number(process.argv[2]) || CITIES.length;
const TARGETS = CITIES.slice(0, LIMIT);

mkdirSync(OUT_DIR, { recursive: true });

console.log(`Rendering ${TARGETS.length} cities (of ${CITIES.length}) from ${DEV_SERVER}, styles rotated across ${STYLES.length}...`);
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ["--no-sandbox"],
});

let done = 0;
let failed = 0;

for (let i = 0; i < TARGETS.length; i++) {
  const city = TARGETS[i];
  const theme = STYLES[i % STYLES.length].themeId;
  const outPath = `${OUT_DIR}${city.slug}.png`;
  if (existsSync(outPath)) {
    done++;
    continue;
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  try {
    const url = `${DEV_SERVER}/crear?${new URLSearchParams({
      lat: String(city.lat),
      lon: String(city.lon),
      city: city.name,
      country: "España",
      theme,
    })}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      () => typeof window.mapagramaExportFullAsync === "function",
      { timeout: 20000 },
    );

    const dataUrl = await page.evaluate(async () => window.mapagramaExportFullAsync("png"));
    if (!dataUrl) throw new Error("no data returned");

    const buffer = Buffer.from(dataUrl.split(",")[1], "base64");
    writeFileSync(outPath, buffer);
    done++;
    console.log(`[ok ${done}/${TARGETS.length}] ${city.slug} (theme=${theme}, ${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    failed++;
    console.log(`[FAIL] ${city.slug}: ${err.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`\nDone. ok=${done} failed=${failed} total=${TARGETS.length}`);
