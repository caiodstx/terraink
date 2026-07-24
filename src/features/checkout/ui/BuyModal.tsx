import { useEffect, useMemo, useState } from "react";
import PickerModal from "@/shared/ui/PickerModal";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { getLayoutOption } from "@/features/layout/infrastructure/layoutRepository";
import { useLocationAutocomplete } from "@/features/location/application/useLocationAutocomplete";
import type { SearchResult } from "@/features/location/domain/types";
import { trackEvent } from "@/core/services";
import { useCatalog } from "../application/useCatalog";
import { useCheckout } from "../application/useCheckout";
import { useDesignThumbnail } from "../application/useDesignThumbnail";
import { resolveVariantId } from "../domain/variantResolver";
import FrameColorCard, { FRAME_COLOR_SWATCH } from "./FrameColorCard";
import CanvasWaitlistCard from "./CanvasWaitlistCard";
import type { FrameColor, PosterKind } from "../domain/types";

const FRAME_COLORS: FrameColor[] = ["natural-wood", "black", "gold"];
const SECOND_CITY_DISCOUNT = 0.2;

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
  // Framed 30x40 is the best margin×conversion combo (España production,
  // ~49% net margin) — preselected as the default rather than making
  // people opt into the better option. Data point, not guesswork: revisit
  // once real per-variant conversion numbers exist (funnel:report).
  const [kind, setKind] = useState<PosterKind>("framed");
  const [frameColor, setFrameColor] = useState<FrameColor>("natural-wood");

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

  const layoutOption = getLayoutOption(state.form.layout);

  const variantId = resolveVariantId(
    state.form.layout,
    kind,
    kind === "framed" ? frameColor : null,
  );
  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? null,
    [variants, variantId],
  );

  // Upsell nudge: only relevant while "Póster" is selected — once they're
  // already looking at "Enmarcado" there's nothing left to upsell them to.
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

  return (
    <PickerModal open={open} title="Comprar póster" onClose={onClose}>
      <div className="buy-modal-body">
        <div
          className="buy-modal-mockup"
          style={{
            borderColor:
              kind === "framed" ? FRAME_COLOR_SWATCH[frameColor] : undefined,
          }}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="Vista previa de tu diseño" />
          ) : (
            <span className="buy-modal-mockup-loading">Generando vista previa…</span>
          )}
        </div>

        <p className="buy-modal-size">
          Tamaño: <strong>{layoutOption?.name ?? state.form.layout}</strong>
        </p>

        <div className="buy-modal-kind-toggle">
          <button
            type="button"
            className={`buy-modal-kind-btn${kind === "framed" ? " is-selected" : ""}`}
            onClick={() => setKind("framed")}
            aria-pressed={kind === "framed"}
          >
            Enmarcado
            <span className="buy-modal-badge">Más vendido</span>
          </button>
          <button
            type="button"
            className={`buy-modal-kind-btn${kind === "poster" ? " is-selected" : ""}`}
            onClick={() => setKind("poster")}
            aria-pressed={kind === "poster"}
          >
            Solo póster
          </button>
        </div>

        {kind === "framed" ? (
          <div className="theme-card-list card-scroll-list">
            {FRAME_COLORS.map((color) => (
              <FrameColorCard
                key={color}
                frameColor={color}
                isSelected={frameColor === color}
                onClick={() => setFrameColor(color)}
              />
            ))}
          </div>
        ) : null}

        <CanvasWaitlistCard />

        {framedUpgradeDeltaCents !== null ? (
          <button
            type="button"
            className="buy-modal-upsell"
            onClick={() => {
              trackEvent("frame_upsell_clicked");
              setKind("framed");
            }}
          >
            ¿Lo prefieres enmarcado? Solo <strong>+{priceFormatter.format(framedUpgradeDeltaCents / 100)}</strong>
          </button>
        ) : null}

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
              ? `Comprar — ${priceFormatter.format(totalPriceCents / 100)}`
              : "Comprar"}
        </button>
      </div>
    </PickerModal>
  );
}
