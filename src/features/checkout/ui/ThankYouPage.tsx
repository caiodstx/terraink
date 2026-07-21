import { Link, useSearchParams } from "react-router-dom";

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="order-result-page">
      <h1>¡Gracias por tu pedido!</h1>
      <p>
        Hemos recibido tu pago y tu póster entra en producción en breve.
        Te enviaremos un email de confirmación con los detalles.
      </p>
      {sessionId ? (
        <p className="order-result-ref">Referencia: {sessionId}</p>
      ) : null}
      <Link to="/crear" className="landing-hero-cta">
        Diseñar otro póster
      </Link>
    </div>
  );
}
