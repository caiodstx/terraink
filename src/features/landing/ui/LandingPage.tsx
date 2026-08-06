import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FooterNote from "@/shared/ui/FooterNote";
import EmailCaptureBanner from "./EmailCaptureBanner";
import ReviewsSection from "./ReviewsSection";
import StickyMobileCta from "./StickyMobileCta";
import { trackEvent } from "@/core/services";
import { CITIES } from "@/data/cities";
import { GIFT_INTENTS } from "@/data/giftIntents";
import { REVIEWS } from "@/data/reviews";
import { STYLES } from "@/data/styles";

const EXAMPLE_CITIES = [
  { city: "Madrid", image: "madrid" },
  { city: "Barcelona", image: "barcelona" },
  { city: "Gijón", image: "gijon" },
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

const PRICE_ROWS = [
  { label: "Póster 30x40cm", price: "29€" },
  { label: "Póster 50x70cm", price: "44€" },
  { label: "Enmarcado 30x40cm", price: "59€" },
  { label: "Enmarcado 50x70cm", price: "89€" },
];

// Kept word-for-word identical to the visible FAQ section below —
// Google requires FAQPage structured data to match on-page content,
// not just exist hidden in the JSON-LD.
const FAQ_ITEMS = [
  {
    question: "¿Puedo elegir cualquier ciudad del mundo?",
    answer:
      "Sí. El mapa usa datos de OpenStreetMap, así que puedes buscar prácticamente cualquier ciudad, pueblo o lugar del mundo, no solo España.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "El póster se imprime bajo pedido en España o la UE una vez confirmado el pago. Verás una estimación de entrega concreta antes de pagar, según el producto y tu dirección.",
  },
  {
    question: "¿Puedo devolver mi pedido si cambio de opinión?",
    answer:
      "Al ser un producto personalizado hecho a medida, no aplica el derecho de desistimiento de 14 días (art. 103 LGDCU). Si llega dañado o hay un error de producción, sí está cubierto.",
  },
  {
    question: "¿Qué tamaños y acabados hay disponibles?",
    answer:
      "Póster 30x40cm o 50x70cm, sin marco o enmarcado en madera natural, negro o dorado.",
  },
  {
    question: "¿Cómo se paga?",
    answer:
      "Con tarjeta u otros métodos a través de Stripe Checkout, de forma segura. El pedido se confirma solo tras confirmarse el pago.",
  },
];

const PRODUCT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Póster de mapa personalizado",
  description:
    "Póster de mapa de cualquier ciudad, personalizable en colores, capas y texto, impreso y enviado bajo demanda desde España.",
  image: "https://mapagrama.com/assets/banner.jpg",
  brand: { "@type": "Brand", name: "Mapagrama" },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "29",
    highPrice: "89",
    offerCount: "4",
    availability: "https://schema.org/InStock",
    url: "https://mapagrama.com/crear",
  },
  // Only from 3 real reviews — Google requires aggregateRating to reflect
  // genuine data, and ReviewsSection.tsx itself won't render below 2.
  ...(REVIEWS.length >= 3
    ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: (
            REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length
          ).toFixed(1),
          reviewCount: String(REVIEWS.length),
        },
      }
    : {}),
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function LandingPage() {
  const heroCtaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-mast">
        <p className="landing-mast-line">Mapas personalizados · impresos en España</p>
        <div className="landing-mast-row">
          <img src="/assets/logo.svg" alt="" className="landing-mast-mark" />
          <span className="landing-mast-name">MAPAGRAMA</span>
        </div>
        <nav className="landing-mast-nav" aria-label="Principal">
          <Link to="/crear">Crear mi mapa →</Link>
        </nav>
        <hr className="landing-mast-rule" aria-hidden="true" />
      </header>

      <section className="landing-hero-photo">
        {/* Matches the preloaded LCP image in index.html (the <link
            rel="preload"> there is what actually drives fetch priority)
            — same file, no lazy loading here (it's above the fold on
            first paint). */}
        <picture>
          <source srcSet="/assets/examples/mockups/hero-valencia.webp" type="image/webp" />
          <img
            className="landing-hero-photo-bleed"
            src="/assets/examples/mockups/hero-valencia.jpg"
            alt="Póster de mapa de Valencia enmarcado en una habitación"
          />
        </picture>
        <div className="landing-hero-caption">
          <p className="landing-hero-eyebrow">El mapa de un lugar que significa algo.</p>
          <h1>Tu ciudad en un póster de mapa personalizado</h1>
          <p>
            Elige tu ciudad, personaliza colores, capas y texto en un editor
            en vivo, y recibe tu mapa impreso en casa.
          </p>
          <Link to="/crear" className="landing-hero-link" ref={heroCtaRef}>
            Empieza a diseñar →
          </Link>
        </div>
      </section>

      <p className="landing-trust-strip">
        Pago seguro con Stripe · Impreso en España · Datos de OpenStreetMap
      </p>

      <section className="landing-examples">
        <p className="landing-section-head">Ejemplos</p>
        <div className="landing-examples-stack">
          {EXAMPLE_CITIES.map(({ city, image }, index) => (
            <figure key={city} className="landing-photo-fold">
              <picture className="landing-example-pair-mockup">
                <source srcSet={`/assets/examples/mockups/${image}.webp`} type="image/webp" />
                <img
                  src={`/assets/examples/mockups/${image}.jpg`}
                  alt={`Póster de mapa de ${city} enmarcado en una habitación`}
                  loading="lazy"
                />
              </picture>
              <picture className="landing-example-pair-poster">
                <source srcSet={`/assets/examples/${image}.webp`} type="image/webp" />
                <img
                  src={`/assets/examples/${image}.jpg`}
                  alt={`Póster de mapa de ${city}`}
                  loading="lazy"
                />
              </picture>
              <figcaption className="landing-photo-fold-caption">
                {String(index + 1).padStart(2, "0")} · {city}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="landing-styles">
          <p className="landing-section-head">Un mapa, infinitos estilos</p>
          <div className="landing-styles-grid">
            {STYLES.map(({ slug, themeId, name }) => (
              <a key={slug} href={`/estilo/${slug}/`} className="landing-style-card">
                <picture>
                  <source srcSet={`/assets/examples/gijon-${themeId}.webp`} type="image/webp" />
                  <img
                    src={`/assets/examples/gijon-${themeId}.jpg`}
                    alt={`Póster de mapa de Gijón, estilo ${name}`}
                    loading="lazy"
                  />
                </picture>
                <p className="landing-style-caption">{name}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-why">
        <p className="landing-section-head">Por qué Mapagrama</p>
        <div className="landing-why-list">
          {WHY_CARDS.map(({ title, body }) => (
            <div key={title} className="landing-why-row">
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-steps">
        <p className="landing-section-head">Cómo funciona</p>
        <ol className="landing-steps-list">
          <li>
            <span className="landing-steps-num">01</span>
            <strong>Elige tu ciudad</strong>
            <p>Busca cualquier lugar del mundo.</p>
          </li>
          <li>
            <span className="landing-steps-num">02</span>
            <strong>Personaliza</strong>
            <p>Colores, capas del mapa, texto y marco.</p>
          </li>
          <li>
            <span className="landing-steps-num">03</span>
            <strong>Recibe tu póster</strong>
            <p>Impreso y enviado a tu casa desde España.</p>
          </li>
        </ol>
      </section>

      <ReviewsSection />

      <section className="landing-pricing">
        <p className="landing-section-head">Precios</p>
        <ul className="landing-pricing-list">
          {PRICE_ROWS.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <span>{row.price}</span>
            </li>
          ))}
        </ul>
        <Link to="/crear" className="landing-hero-link">
          Empieza a diseñar →
        </Link>
      </section>

      <section className="landing-gifts">
        <p className="landing-section-head">Ideas de regalo</p>
        <div className="landing-gifts-grid">
          {GIFT_INTENTS.map(({ slug, title, teaser }) => (
            <a key={slug} href={`/${slug}/`} className="landing-gift-card">
              <strong>{title}</strong>
              <p>{teaser}</p>
            </a>
          ))}
        </div>
      </section>

      <EmailCaptureBanner />

      <section className="landing-faq">
        <p className="landing-section-head">Preguntas frecuentes</p>
        <dl className="landing-faq-list">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <div key={question} className="landing-faq-item">
              <dt>{question}</dt>
              <dd>{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <section className="landing-cities" id="landing-cities">
        <p className="landing-section-head">Pósters de mapa por ciudad</p>
        {/* <details> collapses the list visually, but every <a> stays in
            the DOM either way — SEO/crawlers see the full list regardless
            of open/closed state. */}
        <details className="landing-cities-details">
          <summary>Ver todas las ciudades</summary>
          <ul className="landing-cities-list">
            {CITIES.map(({ slug, name }) => (
              <li key={slug}>
                {/* Plain <a>, not <Link>: these are separate static pages
                    outside the SPA router (see scripts/generate-city-pages.mjs). */}
                <a href={`/mapa/${slug}/`}>Mapa de {name}</a>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <FooterNote />
      <StickyMobileCta targetRef={heroCtaRef} />
    </div>
  );
}
