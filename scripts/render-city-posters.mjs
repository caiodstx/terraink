// Batch-renders a real poster export per city in src/data/cities.ts, using
// the app's own editor + export pipeline (not a mockup/placeholder) — the
// same map engine a real customer's poster comes from.
//
// Requires `bun run dev` running locally first (this drives the actual
// dev server at localhost:5173, using window.mapagramaExportFullAsync
// exposed by DevExportBridge.tsx — dev-only, never present in prod).
// Deep-links each city via /crear?lat=&lon=&city=&country= (see
// useGeolocation's readCityDeepLink()).
//
// Run: bun run dev   (separate terminal, leave running)
//      bun run render:cities
//
// Output: assets-src/examples/<slug>.png (gitignored, full 300dpi — these
// are the source files). Run `bun run process:examples` afterwards (or see
// that script) to produce the resized web JPG/WebP in public/assets/.
//
// Uses puppeteer-core against the system's installed Edge/Chrome rather
// than downloading a bundled browser. Playwright's default (pipe-based)
// launch could not establish a CDP connection in this project's dev
// sandbox — puppeteer-core's TCP-based `--remote-debugging-port` + HTTP
// polling worked reliably instead. If Edge isn't at the path below, adjust
// CHROME_PATH (any Chromium-based browser works).
import puppeteer from "puppeteer-core";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { CITIES } from "../src/data/cities.ts";

const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT_DIR = new URL("../assets-src/examples/", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");
const DEV_SERVER = process.env.DEV_SERVER_URL ?? "http://localhost:5173";

mkdirSync(OUT_DIR, { recursive: true });

console.log(`Rendering ${CITIES.length} cities from ${DEV_SERVER} (skips ones that already have a PNG)...`);
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ["--no-sandbox"],
});

let done = 0;
let failed = 0;

for (const city of CITIES) {
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
    console.log(`[ok ${done}/${CITIES.length}] ${city.slug} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    failed++;
    console.log(`[FAIL] ${city.slug}: ${err.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`\nDone. ok=${done} failed=${failed} total=${CITIES.length}`);
