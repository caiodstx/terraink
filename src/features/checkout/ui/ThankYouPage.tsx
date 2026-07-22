import { Link, useSearchParams } from "react-router-dom";
import { useOrderReference } from "../application/useOrderReference";

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { reference, isLoading } = useOrderReference(sessionId);

  return (
    <div className="order-result-page">
      <h1>¡Gracias por tu pedido!</h1>
      <p>
        Hemos recibido tu pago y tu póster entra en producción en breve.
        Te enviaremos un email de confirmación con los detalles.
      </p>
      {reference ? (
        <p className="order-result-ref">Referencia: {reference}</p>
      ) : isLoading ? (
        <p className="order-result-ref">Preparando tu referencia de pedido…</p>
      ) : null}
      <Link to="/crear" className="landing-hero-cta">
        Diseñar otro póster
      </Link>
    </div>
  );
}
