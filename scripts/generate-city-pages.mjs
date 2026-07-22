// Generates public/mapa/<slug>/index.html (one per city) and
// public/<gift-intent-slug>/index.html (regalo-aniversario, etc.) — real,
// static HTML pages for SEO and social-link previews. This is a Vite SPA
// with a single index.html shell, so client-side routes can't carry
// per-page <title>/meta/OG tags in the initial response; these pages are
// plain HTML instead, served directly by nginx (see nginx.conf's
// `try_files $uri $uri/ /index.html`, which resolves e.g. /mapa/madrid/ to
// that directory's own index.html before ever falling back to the SPA).
//
// Run via `bun run seo:cities` (also wired into `bun run build`, so pages
// stay in sync automatically). Re-run after editing CITIES, GIFT_INTENTS,
// or the copy below.
import { mkdirSync, writeFileSync } from "node:fs";
import { CITIES } from "../src/data/cities.ts";
import { GIFT_INTENTS } from "../src/data/giftIntents.ts";

const SITE_URL = "https://mapagrama.com";
// The only 3 cities with a real poster-in-a-room photo (Smartmockups, shot
// by hand — not something render-city-posters.mjs can produce). Everyone
// else's og:image falls back to their flat map render, which does exist
// for all 70 as of 2026-07-22.
const MOCKUP_SLUGS = new Set(["madrid", "barcelona", "gijon"]);
const PRICE_ROWS = [
  { label: "Póster 30x40cm", price: "29€" },
  { label: "Póster 50x70cm", price: "44€" },
  { label: "Enmarcado 30x40cm", price: "59€" },
  { label: "Enmarcado 50x70cm", price: "89€" },
];
const WHY_CARDS = [
  {
    title: "Personalización real",
    body: "Elige cualquier color en hexadecimal y qué capas del mapa mostrar — no una plantilla cerrada de temas predefinidos.",
  },
  {
    title: "Producción en España",
    body: "Se imprime y envía desde España. Sin aduanas, sin semanas de espera desde fuera de la UE.",
  },
  {
    title: "Precio justo",
    body: "Desde 29€ — por debajo de lo habitual en pósters de mapas personalizados, que suelen arrancar en 45-50€.",
  },
];

function pageHtml(city) {
  const title = `Póster de mapa de ${city.name} personalizado | Mapagrama`;
  const description = `Crea tu propio póster de mapa de ${city.name}, ${city.region} — ${city.blurb}. Elige colores, capas y texto en un editor en vivo. Impreso y enviado desde España, desde 29€.`;
  const canonical = `${SITE_URL}/mapa/${city.slug}/`;
  // Deep-links the editor straight to this city instead of the Madrid
  // default — read by useGeolocation's readCityDeepLink() on mount.
  // & is HTML-escaped since this string lands inside href="..." attributes.
  const editorUrl = `/crear?${new URLSearchParams({
    lat: String(city.lat),
    lon: String(city.lon),
    city: city.name,
    country: "España",
  })}`.replace(/&/g, "&amp;");
  const ogImage = MOCKUP_SLUGS.has(city.slug)
    ? `${SITE_URL}/assets/examples/mockups/${city.slug}.jpg`
    : city.hasExample
      ? `${SITE_URL}/assets/examples/${city.slug}.jpg`
      : `${SITE_URL}/assets/banner.jpg`;

  const previewBlock = city.hasExample
    ? `<picture>
        <source srcset="/assets/examples/${city.slug}.webp" type="image/webp" />
        <img src="/assets/examples/${city.slug}.jpg" alt="Póster de mapa de ${city.name}" loading="lazy" />
      </picture>`
    : "";

  const otherCities = CITIES.filter((c) => c.slug !== city.slug);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <title>${title}</title>

    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Mapagrama" />
    <link rel="canonical" href="${canonical}" />
    <link rel="stylesheet" href="/assets/seo-landing.css" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap"
    />

    <meta name="theme-color" content="#0a1824" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Mapagrama" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${title}",
        "description": "${description}",
        "url": "${canonical}",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Mapagrama",
          "url": "${SITE_URL}"
        }
      }
    </script>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Mapagrama", "item": "${SITE_URL}/" },
          { "@type": "ListItem", "position": 2, "name": "Mapa de ${city.name}", "item": "${canonical}" }
        ]
      }
    </script>
  </head>
  <body>
    <div class="seo-page">
      <header class="seo-header">
        <a href="/" class="seo-brand">
          <img src="/assets/logo.svg" alt="" />
          <span>Mapagrama</span>
        </a>
        <a href="${editorUrl}" class="seo-nav-cta">Crear mi mapa</a>
      </header>

      <section class="seo-hero">
        <h1>Póster de mapa de ${city.name}</h1>
        <p>
          Convierte ${city.name}, ${city.region}, en un póster de mapa
          personalizado — ${city.blurb}. Elige colores, capas y texto en un
          editor en vivo, y recibe tu mapa impreso en casa. Producción en
          España.
        </p>
        <a href="${editorUrl}" class="seo-hero-cta">Diseñar mi póster de ${city.name}</a>
      </section>

      ${
        previewBlock
          ? `<div class="seo-preview">${previewBlock}</div>`
          : ""
      }

      <section class="seo-why">
        <h2>Por qué Mapagrama</h2>
        <div class="seo-why-grid">
          ${WHY_CARDS.map(
            (card) => `<div class="seo-why-card">
            <strong>${card.title}</strong>
            <p>${card.body}</p>
          </div>`,
          ).join("\n          ")}
        </div>
      </section>

      <section class="seo-pricing">
        <h2>Precios</h2>
        <ul class="seo-pricing-list">
          ${PRICE_ROWS.map(
            (row) => `<li><span>${row.label}</span><span>${row.price}</span></li>`,
          ).join("\n          ")}
        </ul>
        <a href="${editorUrl}" class="seo-hero-cta">Empieza a diseñar</a>
      </section>

      <nav class="seo-cities-nav">
        <h2>Otras ciudades</h2>
        <ul>
          ${otherCities
            .map((c) => `<li><a href="/mapa/${c.slug}/">Mapa de ${c.name}</a></li>`)
            .join("\n          ")}
        </ul>
      </nav>

      <footer class="seo-footer">
        <p>© Mapagrama · <a href="/">mapagrama.com</a></p>
      </footer>
    </div>
  </body>
</html>
`;
}

function giftPageHtml(gift) {
  const canonical = `${SITE_URL}/${gift.slug}/`;
  const ogImage = `${SITE_URL}/assets/examples/mockups/${gift.mockupSlug}.jpg`;
  const otherGifts = GIFT_INTENTS.filter((g) => g.slug !== gift.slug);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <link rel="icon" type="image/svg+xml" href="/assets/logo.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <title>${gift.metaTitle}</title>

    <meta name="description" content="${gift.description}" />
    <meta name="robots" content="index, follow" />
    <meta name="author" content="Mapagrama" />
    <link rel="canonical" href="${canonical}" />
    <link rel="stylesheet" href="/assets/seo-landing.css" />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap"
    />

    <meta name="theme-color" content="#0a1824" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Mapagrama" />
    <meta property="og:title" content="${gift.metaTitle}" />
    <meta property="og:description" content="${gift.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${gift.metaTitle}" />
    <meta name="twitter:description" content="${gift.description}" />
    <meta name="twitter:image" content="${ogImage}" />

    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "${gift.metaTitle}",
        "description": "${gift.description}",
        "url": "${canonical}",
        "isPartOf": {
          "@type": "WebSite",
          "name": "Mapagrama",
          "url": "${SITE_URL}"
        }
      }
    </script>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Mapagrama", "item": "${SITE_URL}/" },
          { "@type": "ListItem", "position": 2, "name": "${gift.title}", "item": "${canonical}" }
        ]
      }
    </script>
  </head>
  <body>
    <div class="seo-page">
      <header class="seo-header">
        <a href="/" class="seo-brand">
          <img src="/assets/logo.svg" alt="" />
          <span>Mapagrama</span>
        </a>
        <a href="/crear" class="seo-nav-cta">Crear mi mapa</a>
      </header>

      <section class="seo-hero">
        <h1>${gift.title}</h1>
        <p>${gift.pitch}</p>
        <a href="/crear" class="seo-hero-cta">Diseñar este regalo</a>
      </section>

      <div class="seo-preview">
        <img src="/assets/examples/mockups/${gift.mockupSlug}.jpg" alt="${gift.title}" loading="lazy" />
      </div>

      <section class="seo-why">
        <h2>Por qué Mapagrama</h2>
        <div class="seo-why-grid">
          ${WHY_CARDS.map(
            (card) => `<div class="seo-why-card">
            <strong>${card.title}</strong>
            <p>${card.body}</p>
          </div>`,
          ).join("\n          ")}
        </div>
      </section>

      <section class="seo-pricing">
        <h2>Precios</h2>
        <ul class="seo-pricing-list">
          ${PRICE_ROWS.map(
            (row) => `<li><span>${row.label}</span><span>${row.price}</span></li>`,
          ).join("\n          ")}
        </ul>
        <a href="/crear" class="seo-hero-cta">Empieza a diseñar</a>
      </section>

      <nav class="seo-cities-nav">
        <h2>Otras ideas de regalo</h2>
        <ul>
          ${otherGifts
            .map((g) => `<li><a href="/${g.slug}/">${g.title}</a></li>`)
            .join("\n          ")}
          <li><a href="/#landing-cities">O elige directamente una ciudad</a></li>
        </ul>
      </nav>

      <footer class="seo-footer">
        <p>© Mapagrama · <a href="/">mapagrama.com</a></p>
      </footer>
    </div>
  </body>
</html>
`;
}

for (const city of CITIES) {
  const dir = `public/mapa/${city.slug}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, pageHtml(city));
  console.log(`generated ${dir}/index.html`);
}

for (const gift of GIFT_INTENTS) {
  const dir = `public/${gift.slug}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/index.html`, giftPageHtml(gift));
  console.log(`generated ${dir}/index.html`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemapUrls = [
  { loc: SITE_URL, priority: "1.0" },
  { loc: `${SITE_URL}/crear`, priority: "0.8" },
  ...CITIES.map((c) => ({ loc: `${SITE_URL}/mapa/${c.slug}/`, priority: "0.7" })),
  ...GIFT_INTENTS.map((g) => ({ loc: `${SITE_URL}/${g.slug}/`, priority: "0.7" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
writeFileSync("public/sitemap.xml", sitemap);
console.log("generated public/sitemap.xml");
