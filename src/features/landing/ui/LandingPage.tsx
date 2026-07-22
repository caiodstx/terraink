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
                <img
                  src={`/assets/examples/${image}.jpg`}
                  alt={`Póster de mapa de ${city}`}
                  loading="lazy"
                />
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
              <img
                src={`/assets/examples/mockups/${image}.jpg`}
                alt={`Póster de mapa de ${city} enmarcado en una habitación`}
                loading="lazy"
              />
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
