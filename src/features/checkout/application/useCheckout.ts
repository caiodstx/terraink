import { useCallback, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { trackEvent } from "@/core/services";
import { uploadDesign, uploadDesignPreview, createCheckoutSession } from "../infrastructure/checkoutApi";
import { exportSecondCityPoster, type SecondCityTarget } from "../infrastructure/secondCityExporter";
import type { CatalogVariant } from "../domain/types";

export function useCheckout() {
  const { exportPoster } = useExport();
  const { state, effectiveTheme, mapStyle } = usePosterContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(
    async (variant: CatalogVariant, secondCity?: SecondCityTarget | null) => {
      setIsProcessing(true);
      setError(null);
      try {
        const blob = await exportPoster("png", { quality: "purchase", download: false });
        if (!blob) {
          throw new Error("No se pudo generar el archivo del póster.");
        }

        const { designId, format } = await uploadDesign(blob);
        trackEvent("poster_purchase_exported", {
          variant_id: variant.id,
          price_cents: variant.priceCents,
        });

        // Best-effort: powers the cart-recovery email's image (see
        // webhooks/stripe.ts's handleExpired) with a watermarked, low-res
        // copy — never the full-quality purchase file. A failure here must
        // never block the actual purchase.
        void exportPoster("png", { quality: "email-preview", download: false })
          .then((previewBlob) => previewBlob && uploadDesignPreview(designId, previewBlob))
          .catch(() => {});

        let secondItem: { designId: string; format: string; variantId: string } | undefined;
        if (secondCity) {
          const { form } = state;
          const secondBlob = await exportSecondCityPoster(secondCity, {
            style: mapStyle,
            theme: effectiveTheme,
            distanceMeters: Number(form.distance),
            widthCm: Number(form.width),
            heightCm: Number(form.height),
            fontFamily: form.fontFamily.trim(),
            showPosterText: form.showPosterText,
            dedicationText: form.dedicationText.trim(),
            includeCredits: form.includeCredits,
          });
          const uploaded = await uploadDesign(secondBlob);
          secondItem = { designId: uploaded.designId, format: uploaded.format, variantId: variant.id };
          trackEvent("second_city_upsell_purchased", {
            variant_id: variant.id,
            price_cents: Math.round(variant.priceCents * 0.8),
          });
        }

        const { url } = await createCheckoutSession(
          { designId, format, variantId: variant.id },
          secondItem,
        );
        window.location.href = url;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo iniciar la compra.";
        trackEvent("purchase_failed", { reason: message });
        setError(message);
        setIsProcessing(false);
      }
    },
    [exportPoster, state, effectiveTheme, mapStyle],
  );

  return { purchase, isProcessing, error };
}
