import { useMemo, useState } from "react";
import PickerModal from "@/shared/ui/PickerModal";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { getLayoutOption } from "@/features/layout/infrastructure/layoutRepository";
import { useCatalog } from "../application/useCatalog";
import { useCheckout } from "../application/useCheckout";
import { useDesignThumbnail } from "../application/useDesignThumbnail";
import { resolveVariantId } from "../domain/variantResolver";
import FrameColorCard, { FRAME_COLOR_SWATCH } from "./FrameColorCard";
import type { FrameColor, PosterKind } from "../domain/types";

const FRAME_COLORS: FrameColor[] = ["natural-wood", "black", "gold"];

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
  const [kind, setKind] = useState<PosterKind>("poster");
  const [frameColor, setFrameColor] = useState<FrameColor>("natural-wood");

  const { variants, isLoading, error: catalogError } = useCatalog(open);
  const { purchase, isProcessing, error: purchaseError } = useCheckout();
  const thumbnailUrl = useDesignThumbnail(open);

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

  const canBuy = Boolean(selectedVariant) && !isProcessing;

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
            className={`buy-modal-kind-btn${kind === "poster" ? " is-selected" : ""}`}
            onClick={() => setKind("poster")}
            aria-pressed={kind === "poster"}
          >
            Póster
          </button>
          <button
            type="button"
            className={`buy-modal-kind-btn${kind === "framed" ? " is-selected" : ""}`}
            onClick={() => setKind("framed")}
            aria-pressed={kind === "framed"}
          >
            Enmarcado
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

        {isLoading ? <p className="buy-modal-status">Cargando precios…</p> : null}
        {catalogError ? <p className="buy-modal-error">{catalogError}</p> : null}
        {purchaseError ? <p className="buy-modal-error">{purchaseError}</p> : null}

        <button
          type="button"
          className="buy-modal-cta"
          disabled={!canBuy}
          onClick={() => selectedVariant && void purchase(selectedVariant)}
        >
          {isProcessing
            ? "Preparando el pedido…"
            : selectedVariant
              ? `Comprar — ${priceFormatter.format(selectedVariant.priceCents / 100)}`
              : "Comprar"}
        </button>
      </div>
    </PickerModal>
  );
}
