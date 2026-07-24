// Runs after both `vite build` (client) and `vite build --ssr
// src/entry-server.tsx --outDir dist-ssr` (server) have produced dist/ and
// dist-ssr/. Splits the single built shell into two files:
//
//   dist/index.html      → real static LandingPage markup inside #root,
//                           served ONLY for "/" (see nginx.conf's
//                           `location = /`). React still mounts on top via
//                           the normal createRoot().render() in main.tsx —
//                           that's a full client re-render, not hydration,
//                           so nothing here has to match it exactly.
//   dist/app-shell.html   → byte-identical copy of the original empty
//                           shell, used as nginx's SPA fallback for every
//                           other route (/crear, /pedido/*, ...).
//
// Run: bun run prerender:landing (chained into `bun run build`).
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const indexPath = join(DIST, "index.html");
const shellPath = join(DIST, "app-shell.html");

copyFileSync(indexPath, shellPath);
console.log("Wrote dist/app-shell.html (empty-shell SPA fallback)");

const { render } = await import(join(ROOT, "dist-ssr", "entry-server.js"));
const landingHtml = render();

const shellHtml = readFileSync(indexPath, "utf8");
if (!shellHtml.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html does not contain the expected \'<div id="root"></div>\' — check main.tsx\'s mount point.');
}

const injected = shellHtml.replace(
  '<div id="root"></div>',
  `<div id="root">${landingHtml}</div>`,
);
writeFileSync(indexPath, injected);
console.log(`Injected pre-rendered landing markup into dist/index.html (${landingHtml.length} chars)`);
