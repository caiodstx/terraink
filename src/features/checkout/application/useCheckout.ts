import { useCallback, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import { trackEvent } from "@/core/services";
import { uploadDesign, uploadDesignPreview, createCheckoutSession } from "../infrastructure/checkoutApi";
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
