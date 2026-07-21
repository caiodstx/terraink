import { useCallback, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import { trackEvent } from "@/core/services";
import { uploadDesign, createCheckoutSession } from "../infrastructure/checkoutApi";
import type { CatalogVariant } from "../domain/types";

export function useCheckout() {
  const { exportPoster } = useExport();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchase = useCallback(
    async (variant: CatalogVariant) => {
      setIsProcessing(true);
      setError(null);
      try {
        const blob = await exportPoster("png", { preview: false, download: false });
        if (!blob) {
          throw new Error("No se pudo generar el archivo del póster.");
        }

        const { designId, format } = await uploadDesign(blob);
        trackEvent("poster_purchase_exported", {
          variant_id: variant.id,
          price_cents: variant.priceCents,
        });

        const { url } = await createCheckoutSession(designId, format, variant.id);
        window.location.href = url;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo iniciar la compra.";
        trackEvent("purchase_failed", { reason: message });
        setError(message);
        setIsProcessing(false);
      }
    },
    [exportPoster],
  );

  return { purchase, isProcessing, error };
}
