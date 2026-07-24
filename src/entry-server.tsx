// SSR entry, built separately via `vite build --ssr` (see
// scripts/prerender-landing.mjs and the "build" script in package.json).
// Only renders LandingPage — a static, crawler-visible snapshot for "/",
// never true hydration (the client always does a full createRoot().render()
// on top, which replaces this markup wholesale rather than reconciling it).
// That sidesteps hydration-mismatch bugs entirely: nothing here has to
// match the client render exactly, it just has to be valid HTML.
import { renderToStaticMarkup } from "react-dom/server";
// v7 unified react-router/react-router-dom — StaticRouter lives on the
// main entry (react-router-dom/server doesn't exist as a subpath here).
import { StaticRouter } from "react-router-dom";
import LandingPage from "./features/landing/ui/LandingPage";

export function render(): string {
  return renderToStaticMarkup(
    <StaticRouter location="/">
      <LandingPage />
    </StaticRouter>,
  );
}
