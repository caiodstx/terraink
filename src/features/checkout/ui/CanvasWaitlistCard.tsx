import { useState } from "react";
import { localStorageCache } from "@/core/cache/localStorageCache";
import { trackEvent } from "@/core/services";
import { openLegalDoc } from "@/features/legal/application/legalDoc";
import { submitEmailSignup } from "@/features/landing/infrastructure/emailSignupApi";

const DISMISSED_KEY = "canvasWaitlist.joined";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

type Status = "closed" | "open" | "submitting" | "done" | "error";

// Fake-door demand check (Fase 7, 2026-07-24): before building real canvas
// SKUs/mockups/quality tests, see if anyone actually wants one. Reuses the
// email-signups infra from Fase 6 (POST /email-signups with
// source: "canvas_waitlist" — logs a dedicated canvas_interest_captured
// event, see mapagrama-api's routes/emailSignups.ts) rather than any new
// backend. Revisit in 3-4 weeks with `bun run funnel:report 30`: build it
// for real only if a meaningful share of BuyModal opens result in a signup.
export default function CanvasWaitlistCard() {
  const [status, setStatus] = useState<Status>(() =>
    localStorageCache.read<boolean>(DISMISSED_KEY, ONE_YEAR_MS) ? "done" : "closed",
  );
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  function handleOpen() {
    setStatus("open");
    trackEvent("canvas_waitlist_opened");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent || status === "submitting") return;

    setStatus("submitting");
    try {
      await submitEmailSignup(email.trim(), "canvas_waitlist");
      localStorageCache.write(DISMISSED_KEY, true);
      setStatus("done");
      trackEvent("canvas_waitlist_joined");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="buy-modal-canvas-done">
        Lienzo: apuntado — te avisamos en cuanto esté disponible.
      </p>
    );
  }

  if (status === "closed") {
    return (
      <button type="button" className="buy-modal-upsell" onClick={handleOpen}>
        Lienzo (canvas) — próximamente. <strong>Avisadme</strong>
      </button>
    );
  }

  return (
    <form className="buy-modal-canvas-form" onSubmit={handleSubmit}>
      <p className="buy-modal-canvas-copy">
        Todavía no vendemos lienzo — si hay suficiente interés, lo añadimos. Déjanos tu email y te
        avisamos en cuanto esté listo.
      </p>
      <div className="buy-modal-canvas-fields">
        <input
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="buy-modal-second-city-input"
        />
        <button type="submit" className="buy-modal-upsell" disabled={!consent || status === "submitting"}>
          {status === "submitting" ? "Enviando…" : "Avisadme"}
        </button>
      </div>
      <label className="email-capture-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        Acepto recibir este aviso por email. Ver{" "}
        <button type="button" className="email-capture-privacy-link" onClick={() => openLegalDoc("privacy")}>
          política de privacidad
        </button>
        .
      </label>
      {status === "error" ? (
        <p className="buy-modal-error">No se pudo registrar tu email. Inténtalo de nuevo.</p>
      ) : null}
    </form>
  );
}
