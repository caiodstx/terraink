import { useEffect, useMemo, useState } from "react";
import PickerModal from "@/shared/ui/PickerModal";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { useFormHandlers } from "@/features/poster/application/useFormHandlers";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import type { SearchResult } from "@/features/location/domain/types";
import { trackEvent } from "@/core/services";
import { useCatalog } from "../application/useCatalog";
import { useCheckout } from "../application/useCheckout";
import { useDesignThumbnail } from "../application/useDesignThumbnail";
import { resolveVariantId } from "../domain/variantResolver";
import FrameColorCard from "./FrameColorCard";
import CanvasWaitlistCard from "./CanvasWaitlistCard";
import PosterFramePreview, { type PreviewViewMode } from "./PosterFramePreview";
import type { FrameColor, PosterKind } from "../domain/types";

const FRAME_COLORS: FrameColor[] = ["natural-wood", "black", "gold"];
const SECOND_CITY_DISCOUNT = 0.2;

// layoutId is null for the not-yet-sellable 70x100 — shown as a disabled
// card (same fake-door spirit as the canvas waitlist) rather than hidden,
// since the mockup this was built from expects the shopper to see it and
// understand it's coming, not wonder why the biggest size is missing.
const SIZE_OPTIONS: { layoutId: string | null; label: string; sublabel: string | null }[] = [
  { layoutId: "poster_30x40", label: "30×40 cm", sublabel: "Recomendado" },
  { layoutId: "poster_50x70", label: "50×70 cm", sublabel: null },
  { layoutId: null, label: "70×100 cm", sublabel: "Próximamente" },
];

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

interface BuyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BuyModal({ open, onClose }: BuyModalProps) {
  const { state } = usePosterContext();
  const { handleLayoutChange } = useFormHandlers();
  // Framed 30x40 is the best margin×conversion combo (España production,
  // ~49% net margin) — preselected as the default rather than making
  // people opt into the better option. Data point, not guesswork: revisit
  // once real per-variant conversion numbers exist (funnel:report).
  const [kind, setKind] = useState<PosterKind>("framed");
  const [frameColor, setFrameColor] = useState<FrameColor>("natural-wood");
  const [viewMode, setViewMode] = useState<PreviewViewMode>("front");

  const [secondCityEnabled, setSecondCityEnabled] = useState(false);
  const [secondCityQuery, setSecondCityQuery] = useState("");
  const [secondCityFocused, setSecondCityFocused] = useState(false);
  const [secondCity, setSecondCity] = useState<SearchResult | null>(null);
  const { locationSuggestions, clearLocationSuggestions } = useLocationAutocomplete(
    secondCityQuery,
    secondCityFocused && !secondCity,
  );

  const { variants, isLoading, error: catalogError } = useCatalog(open);
  const { purchase, isProcessing, error: purchaseError } = useCheckout();
  const thumbnailUrl = useDesignThumbnail(open);

  useEffect(() => {
    if (open) trackEvent("buy_modal_opened", { layout: state.form.layout });
    // Fire only on the open transition, not on every layout change while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const variantId = resolveVariantId(
    state.form.layout,
    kind,
    kind === "framed" ? frameColor : null,
  );
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? null,
    [variants, variantId],
  );

  // Upsell nudge: only relevant while "Solo póster" is selected — once
  // they're already looking at "Enmarcado" there's nothing left to upsell.
  const framedUpgradeVariantId = resolveVariantId(state.form.layout, "framed", "natural-wood");
  const framedUpgradeVariant = useMemo(
    () => variants.find((v) => v.id === framedUpgradeVariantId) ?? null,
    [variants, framedUpgradeVariantId],
  );
  const framedUpgradeDeltaCents =
    kind === "poster" && selectedVariant && framedUpgradeVariant
      ? framedUpgradeVariant.priceCents - selectedVariant.priceCents
      : null;

  // Second poster always mirrors the primary's size/frame choice — same
  // variant, just at -20% (server recomputes this exact discount, this is
  // only for display).
  const secondCityPriceCents = selectedVariant
    ? Math.round(selectedVariant.priceCents * (1 - SECOND_CITY_DISCOUNT))
    : null;
  const hasSecondCity = secondCityEnabled && Boolean(secondCity);
  const totalPriceCents =
    (selectedVariant?.priceCents ?? 0) + (hasSecondCity ? secondCityPriceCents ?? 0 : 0);

  const canBuy = Boolean(selectedVariant) && !isProcessing && (!secondCityEnabled || Boolean(secondCity));

  function handleSelectSecondCity(result: SearchResult) {
    setSecondCity(result);
    setSecondCityQuery(result.label);
    clearLocationSuggestions();
    setSecondCityFocused(false);
  }

  function handleToggleSecondCity() {
    const next = !secondCityEnabled;
    setSecondCityEnabled(next);
    if (next) trackEvent("second_city_upsell_shown");
    if (!next) {
      setSecondCity(null);
      setSecondCityQuery("");
    }
  }

  const summary = (
    <div className="buy-modal-summary">
      <div className="buy-modal-summary-row">
        <div className="buy-modal-summary-label">
          <strong>Total</strong>
          <span>Envío incluido</span>
        </div>
        <span className="buy-modal-summary-price">
          {selectedVariant ? priceFormatter.format(totalPriceCents / 100) : "—"}
        </span>
      </div>
      <button
        type="button"
        className="buy-modal-cta"
        disabled={!canBuy}
        onClick={() =>
          selectedVariant &&
          void purchase(
            selectedVariant,
            hasSecondCity && secondCity
              ? {
                  lat: secondCity.lat,
                  lon: secondCity.lon,
                  city: secondCity.city || secondCity.label,
                  country: secondCity.country,
                }
              : null,
          )
        }
      >
        {isProcessing
          ? "Preparando el pedido…"
          : selectedVariant
            ? `Añadir al carrito — ${priceFormatter.format(totalPriceCents / 100)}`
            : "Comprar"}
      </button>
      <p className="buy-modal-secure-note">Pago seguro con Stripe</p>
    </div>
  );

  return (
    <PickerModal open={open} title="Comprar póster" onClose={onClose} wide footer={summary}>
      <div className="buy-modal-layout">
        <div className="buy-modal-preview-col">
          <PosterFramePreview
            thumbnailUrl={thumbnailUrl}
            kind={kind}
            frameColor={frameColor}
            viewMode={viewMode}
          />

          <div className="buy-modal-view-toggle" role="group" aria-label="Modo de vista previa">
            <button
              type="button"
              className={viewMode === "front" ? "is-selected" : ""}
              onClick={() => setViewMode("front")}
              aria-pressed={viewMode === "front"}
            >
              Vista frontal
            </button>
            <button
              type="button"
              className={viewMode === "wall" ? "is-selected" : ""}
              onClick={() => setViewMode("wall")}
              aria-pressed={viewMode === "wall"}
            >
              Vista en pared
            </button>
          </div>

          <p className="buy-modal-print-info">
            Impresión de alta calidad en papel mate premium de 200g/m².
          </p>
        </div>

        <div className="buy-modal-options-col">
          <section className="buy-modal-step">
            <h4 className="buy-modal-step-title">
              <span className="buy-modal-step-num">1</span> Tamaño
            </h4>
            <div className="buy-modal-size-grid">
              {SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  disabled={!opt.layoutId}
                  className={`buy-modal-size-card${opt.layoutId === state.form.layout ? " is-selected" : ""}`}
                  onClick={() => opt.layoutId && handleLayoutChange(opt.layoutId)}
                >
                  <span className="buy-modal-size-label">{opt.label}</span>
                  {opt.sublabel ? (
                    <span className="buy-modal-size-sublabel">{opt.sublabel}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <section className="buy-modal-step">
            <h4 className="buy-modal-step-title">
              <span className="buy-modal-step-num">2</span> Presentación
            </h4>
            <div className="buy-modal-presentation-grid">
              <button
                type="button"
                className={`buy-modal-presentation-card${kind === "poster" ? " is-selected" : ""}`}
                onClick={() => setKind("poster")}
                aria-pressed={kind === "poster"}
              >
                <strong>Solo póster</strong>
                <span>Sin marco</span>
              </button>
              <button
                type="button"
                className={`buy-modal-presentation-card${kind === "framed" ? " is-selected" : ""}`}
                onClick={() => setKind("framed")}
                aria-pressed={kind === "framed"}
              >
                <span className="buy-modal-badge">Recomendado</span>
                <strong>Enmarcado</strong>
                <span>Listo para colgar</span>
              </button>
            </div>
          </section>

          {kind === "framed" ? (
            <section className="buy-modal-step">
              <h4 className="buy-modal-step-title">
                <span className="buy-modal-step-num">3</span> Marco
                <span className="buy-modal-step-badge">Premium</span>
              </h4>
              <div className="buy-modal-frame-grid">
                {FRAME_COLORS.map((color) => (
                  <FrameColorCard
                    key={color}
                    frameColor={color}
                    isSelected={frameColor === color}
                    onClick={() => setFrameColor(color)}
                  />
                ))}
              </div>
            </section>
          ) : framedUpgradeDeltaCents !== null ? (
            <button
              type="button"
              className="buy-modal-upsell"
              onClick={() => {
                trackEvent("frame_upsell_clicked");
                setKind("framed");
              }}
            >
              ¿Lo prefieres enmarcado? Solo{" "}
              <strong>+{priceFormatter.format(framedUpgradeDeltaCents / 100)}</strong>
            </button>
          ) : null}

          <CanvasWaitlistCard />

          <label className="buy-modal-second-city-toggle">
            <input type="checkbox" checked={secondCityEnabled} onChange={handleToggleSecondCity} />
            Añadir una segunda ciudad{" "}
            {secondCityPriceCents !== null ? (
              <strong>(-20%, {priceFormatter.format(secondCityPriceCents / 100)})</strong>
            ) : (
              <strong>(-20%)</strong>
            )}
          </label>

          {secondCityEnabled ? (
            <div className="buy-modal-second-city">
              {secondCity ? (
                <div className="buy-modal-second-city-chip">
                  <span>{secondCity.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSecondCity(null);
                      setSecondCityQuery("");
                    }}
                    aria-label="Quitar segunda ciudad"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="buy-modal-second-city-search">
                  <input
                    type="text"
                    value={secondCityQuery}
                    onChange={(e) => setSecondCityQuery(e.target.value)}
                    onFocus={() => setSecondCityFocused(true)}
                    onBlur={() => window.setTimeout(() => setSecondCityFocused(false), 150)}
                    placeholder="Busca la segunda ciudad…"
                    className="buy-modal-second-city-input"
                  />
                  {secondCityFocused && locationSuggestions.length > 0 ? (
                    <ul className="buy-modal-second-city-suggestions">
                      {locationSuggestions.map((result) => (
                        <li key={result.id}>
                          <button type="button" onClick={() => handleSelectSecondCity(result)}>
                            {result.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          {isLoading ? <p className="buy-modal-status">Cargando precios…</p> : null}
          {catalogError ? <p className="buy-modal-error">{catalogError}</p> : null}
          {purchaseError ? <p className="buy-modal-error">{purchaseError}</p> : null}
        </div>
      </div>
    </PickerModal>
  );
}
