import { Link } from "react-router-dom";
import FooterNote from "@/shared/ui/FooterNote";

const EXAMPLE_CITIES = [
  { city: "Madrid", image: "madrid" },
  { city: "Barcelona", image: "barcelona" },
  { city: "Gijón", image: "gijon" },
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
