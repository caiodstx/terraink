import { Link } from "react-router-dom";
import FooterNote from "@/shared/ui/FooterNote";

const EXAMPLE_CITIES = [
  { city: "Gijón", country: "España · 43.5° N, 5.66° O" },
  { city: "Oviedo", country: "España · 43.36° N, 5.84° O" },
  { city: "Madrid", country: "España · 40.42° N, 3.70° O" },
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
          {EXAMPLE_CITIES.map(({ city, country }) => (
            <div key={city} className="landing-example-card">
              <div className="landing-example-preview" aria-hidden="true" />
              <div className="landing-example-typeblock">
                <p className="landing-example-city">{city}</p>
                <p className="landing-example-country">{country}</p>
              </div>
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

      <FooterNote />
    </div>
  );
}
