import { Link } from "react-router-dom";

export default function CancelledPage() {
  return (
    <div className="order-result-page">
      <h1>Pedido cancelado</h1>
      <p>No se ha realizado ningún cargo. Puedes volver a intentarlo cuando quieras.</p>
      <Link to="/crear" className="landing-hero-cta">
        Volver al editor
      </Link>
    </div>
  );
}
