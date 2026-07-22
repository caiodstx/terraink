import { Link } from "react-router-dom";
import FooterNote from "@/shared/ui/FooterNote";

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

// Kept in sync by hand with scripts/city-data.mjs — different runtimes
// (Vite app vs. the plain Node build script), no easy shared import.
const CITY_LINKS = [
  { slug: "madrid", name: "Madrid" },
  { slug: "barcelona", name: "Barcelona" },
  { slug: "valencia", name: "Valencia" },
  { slug: "sevilla", name: "Sevilla" },
  { slug: "zaragoza", name: "Zaragoza" },
  { slug: "malaga", name: "Málaga" },
  { slug: "bilbao", name: "Bilbao" },
  { slug: "gijon", name: "Gijón" },
  { slug: "murcia", name: "Murcia" },
  { slug: "vigo", name: "Vigo" },
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
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <img src="/assets/logo.svg" alt="" className="landing-logo" />
          <span className="landing-brand-name">Mapagrama</span>
        </div>
        <Link to="/crear" className="landing-nav-cta">
          Crear mi mapa
        </Link>
      </header>

      <section className="landing-hero">
        <h1>Tu ciudad, convertida en un póster.</h1>
        <p>
          Elige tu ciudad, personaliza colores, capas y texto en un editor en
          vivo, y recibe tu mapa impreso en casa. Producción en España.
        </p>
        <Link to="/crear" className="landing-hero-cta">
          Empieza a diseñar
        </Link>
      </section>

      <section className="landing-examples">
        <h2>Algunos ejemplos</h2>
        <div className="landing-examples-grid">
          {EXAMPLE_CITIES.map(({ city, image }) => (
            <div key={city} className="landing-example-card">
              <div className="landing-example-preview">
                <picture>
                  <source srcSet={`/assets/examples/${image}.webp`} type="image/webp" />
                  <img
                    src={`/assets/examples/${image}.jpg`}
                    alt={`Póster de mapa de ${city}`}
                    loading="lazy"
                  />
                </picture>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-mockups">
        <h2>En tu pared</h2>
        <div className="landing-mockups-grid">
          {EXAMPLE_CITIES.map(({ city, image }) => (
            <div key={city} className="landing-mockup-card">
              <picture>
                <source srcSet={`/assets/examples/mockups/${image}.webp`} type="image/webp" />
                <img
                  src={`/assets/examples/mockups/${image}.jpg`}
                  alt={`Póster de mapa de ${city} enmarcado en una habitación`}
                  loading="lazy"
                />
              </picture>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-why">
        <h2>Por qué Mapagrama</h2>
        <div className="landing-why-grid">
          {WHY_CARDS.map(({ title, body }) => (
            <div key={title} className="landing-why-card">
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-steps">
        <h2>Cómo funciona</h2>
        <ol className="landing-steps-list">
          <li>
            <strong>1. Elige tu ciudad</strong>
            <p>Busca cualquier lugar del mundo.</p>
          </li>
          <li>
            <strong>2. Personaliza</strong>
            <p>Colores, capas del mapa, texto y marco.</p>
          </li>
          <li>
            <strong>3. Recibe tu póster</strong>
            <p>Impreso y enviado a tu casa desde España.</p>
          </li>
        </ol>
      </section>

      <section className="landing-pricing">
        <h2>Precios</h2>
        <ul className="landing-pricing-list">
          {PRICE_ROWS.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <span>{row.price}</span>
            </li>
          ))}
        </ul>
        <Link to="/crear" className="landing-hero-cta">
          Empieza a diseñar
        </Link>
      </section>

      <section className="landing-faq">
        <h2>Preguntas frecuentes</h2>
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

      <section className="landing-cities">
        <h2>Pósters de mapa por ciudad</h2>
        <ul className="landing-cities-list">
          {CITY_LINKS.map(({ slug, name }) => (
            <li key={slug}>
              {/* Plain <a>, not <Link>: these are separate static pages
                  outside the SPA router (see scripts/generate-city-pages.mjs). */}
              <a href={`/mapa/${slug}/`}>Mapa de {name}</a>
            </li>
          ))}
        </ul>
      </section>

      <FooterNote />
    </div>
  );
}
