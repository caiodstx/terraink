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
    console.info(
      "[dev] window.mapagramaExportFull('png' | 'pdf' | 'svg') — full 300dpi, no watermark.",
    );
    return () => {
      delete (window as any).mapagramaExportFull;
    };
  }, [exportPoster]);

  return null;
}
