import { useEffect } from "react";
import { useExport } from "@/features/export/application/useExport";
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
    console.info(
      "[dev] window.mapagramaExportFull('png' | 'pdf' | 'svg') — full 300dpi, no watermark.",
    );
    return () => {
      delete (window as any).mapagramaExportFull;
      delete (window as any).mapagramaExportFullAsync;
    };
  }, [exportPoster]);

  return null;
}
