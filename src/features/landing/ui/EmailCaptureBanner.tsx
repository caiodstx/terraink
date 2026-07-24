import { useEffect, useState } from "react";
import { localStorageCache } from "@/core/cache/localStorageCache";
import { trackEvent } from "@/core/services";
import { openLegalDoc } from "@/features/legal/application/legalDoc";
import { submitEmailSignup } from "../infrastructure/emailSignupApi";

const DISMISSED_KEY = "emailCapture.dismissed";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

type Status = "hidden" | "offer" | "submitting" | "success" | "error";

export default function EmailCaptureBanner() {
  const [status, setStatus] = useState<Status>("hidden");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const dismissed = localStorageCache.read<boolean>(DISMISSED_KEY, ONE_YEAR_MS);
    if (dismissed) return;
    setStatus("offer");
    trackEvent("email_capture_shown");
  }, []);

  function dismiss() {
    localStorageCache.write(DISMISSED_KEY, true);
    setStatus("hidden");
    trackEvent("email_capture_dismissed");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || status === "submitting") return;

    setStatus("submitting");
    setErrorMessage("");
    try {
      const newCode = await submitEmailSignup(email.trim());
      setCode(newCode);
      setStatus("success");
      localStorageCache.write(DISMISSED_KEY, true);
      trackEvent("email_capture_submitted");
    } catch {
      setErrorMessage("No se pudo registrar tu email. Inténtalo de nuevo.");
      setStatus("error");
    }
  }

  if (status === "hidden") return null;

  if (status === "success") {
    return (
      <div className="email-capture-banner email-capture-success">
        <p>
          ¡Listo! Tu código de <strong>-10% en tu primer pedido</strong> es{" "}
          <strong className="email-capture-code">{code}</strong>. Guárdalo — podrás
          introducirlo al pagar.
        </p>
      </div>
    );
  }

  return (
    <form className="email-capture-banner" onSubmit={handleSubmit}>
      <div className="email-capture-copy">
        <strong>-10% en tu primer pedido.</strong> Déjanos tu email y te lo mandamos.
      </div>

      <div className="email-capture-fields">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="email-capture-input"
        />
        <button
          type="submit"
          className="email-capture-submit"
          disabled={!consent || status === "submitting"}
        >
          {status === "submitting" ? "Enviando…" : "Consigo mi -10%"}
        </button>
        <button
          type="button"
          className="email-capture-dismiss"
          onClick={dismiss}
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>

      <label className="email-capture-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        Acepto recibir este código por email. Ver{" "}
        <button type="button" className="email-capture-privacy-link" onClick={() => openLegalDoc("privacy")}>
          política de privacidad
        </button>
        .
      </label>

      {status === "error" ? <p className="email-capture-error">{errorMessage}</p> : null}
    </form>
  );
}
