import {
  APP_VERSION,
  CONTACT_EMAIL,
  LEGAL_NOTICE_URL,
  PRIVACY_URL,
  TERMS_URL,
  WITHDRAWAL_URL,
} from "@/core/config";
import { InfoIcon } from "@/shared/ui/Icons";
import { openLegalDoc } from "@/features/legal/application/legalDoc";

function handleCookieSettings() {
  const gfc = (window as any).googlefc;
  gfc?.callbackQueue?.push({
    CONSENT_DATA_READY: () => gfc.showRevocationMessage(),
  });
}

export default function FooterNote() {
  const appVersion = APP_VERSION;
  const contactEmail = String(CONTACT_EMAIL ?? "").trim();
  // These vars hold the raw markdown URLs; the links open the in-app modal.
  const legalDocLinks: { label: string; doc: "imprint" | "privacy" | "terms" | "withdrawal" }[] = [
    { label: "Aviso Legal", doc: "imprint" },
    { label: "Privacidad", doc: "privacy" },
    { label: "Condiciones de Venta", doc: "terms" },
    { label: "Desistimiento", doc: "withdrawal" },
  ];
  const docUrlAvailable: Record<string, boolean> = {
    imprint: Boolean(String(LEGAL_NOTICE_URL ?? "").trim()),
    privacy: Boolean(String(PRIVACY_URL ?? "").trim()),
    terms: Boolean(String(TERMS_URL ?? "").trim()),
    withdrawal: Boolean(String(WITHDRAWAL_URL ?? "").trim()),
  };
  const availableLegalLinks = legalDocLinks.filter(
    ({ doc }) => docUrlAvailable[doc],
  );

  return (
    <footer className="app-footer desktop-footer">
      <div className="desktop-footer-left">
        <p className="source-note">
          {contactEmail && (
            <a className="source-link" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          )}
          {contactEmail && " | "}
          {/* Real anchor, not a JS-modal button: this content needs to be
              reachable by anything that doesn't execute JS (Pinterest's
              merchant review rejected the catalog over exactly this — the
              return policy only existed inside openLegalDoc's modal). See
              scripts/generate-city-pages.mjs's shippingReturnsPageHtml. */}
          <a className="source-link" href="/envios-y-devoluciones/">
            Envíos y devoluciones
          </a>{" | "}
          {availableLegalLinks.map(({ label, doc }) => (
            <span key={doc}>
              <button
                type="button"
                className="source-link"
                onClick={() => openLegalDoc(doc)}
              >
                {label}
              </button>{" | "}
            </span>
          ))}
          <button
            type="button"
            className="source-link"
            onClick={handleCookieSettings}
          >
            Configuración de cookies
          </button>
        </p>
      </div>

      <div className="desktop-footer-middle">
        <p className="made-note">
          Mapagrama v{appVersion} | © 2026
        </p>
      </div>

      <div className="desktop-footer-right">
        <p className="source-note">
          Map data &copy;{" "}
          <a
            className="source-link"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap contributors
          </a>
        </p>
        <button
          type="button"
          className="desktop-footer-info-btn"
          aria-label="More map attribution"
          aria-expanded="false"
        >
          <InfoIcon />
        </button>
        <div className="desktop-footer-attribution">
          Tiles &copy;{" "}
          <a
            className="source-link"
            href="https://openmaptiles.org/"
            target="_blank"
            rel="noreferrer"
          >
            OpenMapTiles
          </a>
          {" | "}Powered by{" "}
          <a
            className="source-link"
            href="https://openfreemap.org/"
            target="_blank"
            rel="noreferrer"
          >
            OpenFreeMap
          </a>
          {", "}
          <a
            className="source-link"
            href="https://nominatim.openstreetmap.org/"
            target="_blank"
            rel="noreferrer"
          >
            Nominatim
          </a>
          {" & "}
          <a
            className="source-link"
            href="https://maplibre.org/"
            target="_blank"
            rel="noreferrer"
          >
            MapLibre
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
