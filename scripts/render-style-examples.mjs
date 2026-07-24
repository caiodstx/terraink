// Renders the same city (Gijón) in 3 different themes, for the landing's
// "Un mapa, infinitos estilos" row (LandingPage.tsx) — same real render
// pipeline as render-city-posters.mjs, just with a fixed city and a
// `theme` deep-link param instead of one render per city (see
// cityDeepLink.ts / useGeolocation.ts for how `theme` is read).
//
// Requires `bun run dev` running locally first, same as render-city-posters.
// Run: bun run render:styles
//
// Output: assets-src/examples/gijon-<theme>.png — same flat directory
// process-examples.mjs already reads, so `bun run process:examples`
// picks these up with no changes needed there.
import puppeteer from "puppeteer-core";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT_DIR = new URL("../assets-src/examples/", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");
const DEV_SERVER = process.env.DEV_SERVER_URL ?? "http://localhost:5173";

const CITY = { name: "Gijón", lat: 43.5322, lon: -5.6611 };
// ids from src/data/themes.json — midnight/terracota/claro per the landing copy.
const THEMES = ["midnight_blue", "terracotta", "carrara"];

mkdirSync(OUT_DIR, { recursive: true });

console.log(`Rendering ${CITY.name} in ${THEMES.length} themes from ${DEV_SERVER}...`);
const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ["--no-sandbox"],
});

let done = 0;
let failed = 0;

for (const theme of THEMES) {
  const outPath = `${OUT_DIR}gijon-${theme}.png`;
  if (existsSync(outPath)) {
    done++;
    continue;
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  try {
    const url = `${DEV_SERVER}/crear?${new URLSearchParams({
      lat: String(CITY.lat),
      lon: String(CITY.lon),
      city: CITY.name,
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
    console.log(`[ok ${done}/${THEMES.length}] gijon-${theme} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    failed++;
    console.log(`[FAIL] gijon-${theme}: ${err.message}`);
  } finally {
    await page.close();
  }
}

await browser.close();
console.log(`\nDone. ok=${done} failed=${failed} total=${THEMES.length}`);
