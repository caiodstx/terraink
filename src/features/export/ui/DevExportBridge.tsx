import { useEffect } from "react";
import { useExport } from "@/features/export/application/useExport";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { exportSecondCityPoster } from "@/features/checkout/infrastructure/secondCityExporter";
import type { ExportFormat } from "@/features/export/domain/types";

/**
 * Dev-only helper so the site owner can generate clean, full-quality,
 * unwatermarked exports (e.g. for marketing/landing images) from `bun run
 * dev` without touching the paywall. `import.meta.env.DEV` is statically
 * false in production builds, so AppShell never even lazy-loads this
 * component when deployed — it cannot exist on the live site.
 */
export default function DevExportBridge() {
  const { exportPoster } = useExport();
  const { state, effectiveTheme, mapStyle } = usePosterContext();

  useEffect(() => {
    (window as any).mapagramaExportFull = (format: ExportFormat = "png") => {
      void exportPoster(format, { quality: "purchase", download: true });
    };
    // Headless-automation variant (scripts/render-city-posters.mjs, used to
    // batch-generate the /mapa/<slug>/ hero images) — returns a base64 data
    // URL instead of triggering a browser download, which is awkward to
    // intercept reliably from Playwright.
    (window as any).mapagramaExportFullAsync = async (format: ExportFormat = "png") => {
      const blob = await exportPoster(format, { quality: "purchase", download: false });
      if (!blob) return null;
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    // Exercises the BuyModal "second city -20%" upsell's render pipeline
    // (features/checkout/infrastructure/secondCityExporter.ts) in
    // isolation — no catalog/Stripe/network dependency, so it works even
    // without a backend running locally.
    (window as any).mapagramaExportSecondCityAsync = async (
      lat: number,
      lon: number,
      city: string,
      country: string,
    ) => {
      const { form } = state;
      const blob = await exportSecondCityPoster(
        { lat, lon, city, country },
        {
          style: mapStyle,
          theme: effectiveTheme,
          distanceMeters: Number(form.distance),
          widthCm: Number(form.width),
          heightCm: Number(form.height),
          fontFamily: form.fontFamily.trim(),
          showPosterText: form.showPosterText,
          includeCredits: form.includeCredits,
        },
      );
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    console.info(
      "[dev] window.mapagramaExportFull('png' | 'pdf' | 'svg') — full 300dpi, no watermark.",
    );
    return () => {
      delete (window as any).mapagramaExportFull;
      delete (window as any).mapagramaExportFullAsync;
      delete (window as any).mapagramaExportSecondCityAsync;
    };
  }, [exportPoster, state, effectiveTheme, mapStyle]);

  return null;
}
