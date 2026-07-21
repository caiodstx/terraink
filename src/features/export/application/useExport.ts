import { useCallback, useMemo } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import { localStorageCache } from "@/core/cache/localStorageCache";
import type { ExportFormat } from "@/features/export/domain/types";
import { captureMapAsCanvas } from "@/features/export/infrastructure/mapExporter";
import { applyPreviewWatermark } from "@/features/export/infrastructure/previewWatermark";
import { compositeExport } from "@/features/poster/infrastructure/renderer";
import { resolveCanvasSize } from "@/features/poster/infrastructure/renderer/canvas";
import { getAllMarkerIcons } from "@/features/markers/infrastructure/iconRegistry";
import { ensureGoogleFont } from "@/core/services";
import {
  createPngBlob,
  createPdfBlobFromCanvas,
  createLayeredSvgBlobFromMap,
  createPosterFilename,
  triggerDownloadBlob,
} from "@/core/services";
import {
  CM_PER_INCH,
  DEFAULT_POSTER_WIDTH_CM,
  DEFAULT_POSTER_HEIGHT_CM,
} from "@/core/config";
import { trackEvent, setUserProperty } from "@/core/services";

// Free preview / in-modal thumbnail: low enough that it's useless as a
// print file, still clear enough to judge the design. Purchases always
// render at full 300dpi.
const LOW_DPI = 72;
const PURCHASE_DPI = 300;

export type ExportQuality = "purchase" | "preview" | "thumbnail";

export interface ExportRunOptions {
  /** Default true — set false to get the Blob back without saving it to disk. */
  download?: boolean;
  /**
   * Default "purchase" (full 300dpi, requested format, no watermark).
   * "preview" forces PNG at LOW_DPI with a watermark (the free download).
   * "thumbnail" forces PNG at LOW_DPI with NO watermark (e.g. the frame
   * mockup in the buy modal — not meant to be saved/downloaded).
   */
  quality?: ExportQuality;
}

const EXPORT_COUNT_STORAGE_KEY = "mapagrama.poster.count";

// Use a 1-year TTL so the export count persists across sessions.
const EXPORT_COUNT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

// Report time-to-first-export once per session (not per export).
let firstExportTimed = false;

// Timestamp of the last export this session, for measuring the gap between
// exports. Stays null until the first export, so the param is omitted then.
let lastExportAt: number | null = null;

/**
 * Fires the analytics for a successful export: the poster_exported event,
 * the once-per-session time-to-first-export, and the lifetime_export_count
 * user property (the current total, not a per-event log entry).
 */
function reportExportSuccess(
  nextCount: number,
  exportParams: Record<string, string | number | boolean>,
): void {
  trackEvent("poster_exported", exportParams);

  if (!firstExportTimed) {
    firstExportTimed = true;
    trackEvent("time_to_first_export", {
      seconds_to_first_export: Math.round(
        (Date.now() - performance.timeOrigin) / 1000,
      ),
    });
  }

  lastExportAt = Date.now();
  setUserProperty("lifetime_export_count", nextCount);
}

function readPosterExportCount(): number {
  const stored = localStorageCache.read<number>(
    EXPORT_COUNT_STORAGE_KEY,
    EXPORT_COUNT_TTL_MS,
  );
  if (typeof stored === "number" && Number.isFinite(stored) && stored >= 0) {
    return Math.floor(stored);
  }
  return 0;
}

function writePosterExportCount(nextCount: number): void {
  localStorageCache.write(EXPORT_COUNT_STORAGE_KEY, nextCount);
}

/**
 * Provides handlers for exporting the live poster preview as PNG or PDF.
 *
 * Flow:
 * 1. Resize MapLibre container to full export resolution.
 * 2. Wait for tiles at new resolution.
 * 3. Snapshot the WebGL canvas.
 * 4. Composite fades + text onto the snapshot.
 * 5. Download.
 */
export function useExport() {
  const { state, dispatch, effectiveTheme, mapRef } = usePosterContext();
  const { form } = state;
  const hasVisibleMarkers = form.showMarkers && state.markers.length > 0;
  const visibleRoutes = useMemo(
    () =>
      form.showRoutes
        ? state.routes.filter((route) => route.visible)
        : [],
    [form.showRoutes, state.routes],
  );
  const hasVisibleOverlays = hasVisibleMarkers || visibleRoutes.length > 0;

  const registerSuccessfulExport = useCallback((nextCount: number) => {
    writePosterExportCount(nextCount);
  }, []);

  const exportPoster = useCallback(
    async (
      format: ExportFormat,
      options?: ExportRunOptions,
    ): Promise<Blob | null> => {
      const quality = options?.quality ?? "purchase";
      const shouldDownload = options?.download ?? true;
      const effectiveFormat: ExportFormat = quality === "purchase" ? format : "png";
      const shouldWatermark = quality === "preview";
      // Only the free preview counts toward the lifetime download counter —
      // thumbnails are silent UI chrome, purchases are tracked separately
      // by the checkout flow (with variant/price context this hook lacks).
      const countsAsFreePreview = quality === "preview";

      const map = mapRef.current;
      if (!map) {
        dispatch({ type: "SET_ERROR", error: "Map is not ready." });
        return null;
      }

      dispatch({ type: "SET_EXPORT_STATUS", exporting: true });

      try {
        // Ensure font is loaded before compositing text
        if (form.showPosterText && form.fontFamily.trim()) {
          await ensureGoogleFont(form.fontFamily.trim());
        }

        const widthCm = Number(form.width) || DEFAULT_POSTER_WIDTH_CM;
        const heightCm = Number(form.height) || DEFAULT_POSTER_HEIGHT_CM;
        const dpi = quality === "purchase" ? PURCHASE_DPI : LOW_DPI;
        const widthInches = widthCm / CM_PER_INCH;
        const heightInches = heightCm / CM_PER_INCH;

        // Aggregate, non-personal export data. Use only the structured city /
        // country — never raw input (form.location) or coordinates. Only
        // free previews feed the lifetime export counter — purchases are
        // tracked separately by the checkout flow, with their own context
        // (variant, price) that this hook doesn't know about.
        const nextCount = readPosterExportCount() + 1;
        const secondsBetweenExports =
          lastExportAt !== null
            ? Math.round((Date.now() - lastExportAt) / 1000)
            : null;
        const exportParams = {
          format: effectiveFormat,
          poster_city: form.displayCity.trim() || "unknown",
          poster_country: form.displayCountry.trim() || "unknown",
          theme: form.theme,
          poster_size: `${widthCm}x${heightCm}`,
          font: form.fontFamily.trim() || "default",
          has_markers: hasVisibleMarkers,
          has_routes: visibleRoutes.length > 0,
          export_number: nextCount,
          ...(secondsBetweenExports !== null
            ? { seconds_between_exports: secondsBetweenExports }
            : {}),
        };

        const size = resolveCanvasSize(widthInches, heightInches, dpi);

        const lat = Number(form.latitude) || 0;
        const lon = Number(form.longitude) || 0;

        if (effectiveFormat === "svg") {
          const svgBlob = await createLayeredSvgBlobFromMap({
            map,
            exportWidth: size.width,
            exportHeight: size.height,
            theme: effectiveTheme,
            center: { lat, lon },
            displayCity: form.displayCity || form.location || "",
            displayCountry: form.displayCountry || "",
            fontFamily: form.fontFamily.trim(),
            showPosterText: form.showPosterText,
            showOverlay: form.showMarkers,
            includeCredits: form.includeCredits,
            markers: hasVisibleMarkers ? state.markers : [],
            markerIcons: hasVisibleOverlays
              ? getAllMarkerIcons(state.customMarkerIcons)
              : [],
            routes: visibleRoutes,
          });
          if (shouldDownload) {
            const svgFilename = createPosterFilename(
              form.displayCity || form.location,
              form.theme,
              "svg",
            );
            await triggerDownloadBlob(svgBlob, svgFilename);
          }
          if (countsAsFreePreview) {
            reportExportSuccess(nextCount, exportParams);
            registerSuccessfulExport(nextCount);
          }
          dispatch({ type: "SET_EXPORT_STATUS", exporting: false });
          return svgBlob;
        }

        // 1. Capture map at full export resolution
        const {
          canvas: mapCanvas,
          markerProjection,
          markerScaleX,
          markerScaleY,
          markerSizeScale,
        } = await captureMapAsCanvas(map, size.width, size.height);

        // 2. Composite fades + text
        const { canvas } = await compositeExport(mapCanvas, {
          theme: effectiveTheme,
          center: { lat, lon },
          widthInches,
          heightInches,
          displayCity: form.displayCity || form.location || "",
          displayCountry: form.displayCountry || "",
          fontFamily: form.fontFamily.trim(),
          showPosterText: form.showPosterText,
          showOverlay: form.showMarkers,
          includeCredits: form.includeCredits,
          markers: hasVisibleMarkers ? state.markers : [],
          markerIcons: hasVisibleOverlays
            ? getAllMarkerIcons(state.customMarkerIcons)
            : [],
          markerProjection: hasVisibleOverlays ? markerProjection : undefined,
          markerScaleX: hasVisibleOverlays ? markerScaleX : undefined,
          markerScaleY: hasVisibleOverlays ? markerScaleY : undefined,
          markerSizeScale: hasVisibleOverlays ? markerSizeScale : undefined,
          routes: visibleRoutes,
        });

        if (shouldWatermark) {
          applyPreviewWatermark(canvas);
        }

        // 3. Build the blob (and download it, unless this is a purchase run)
        const filename = createPosterFilename(
          form.displayCity || form.location,
          form.theme,
          effectiveFormat,
        );

        let blob: Blob;
        if (effectiveFormat === "pdf") {
          blob = createPdfBlobFromCanvas(canvas, { widthCm, heightCm });
        } else {
          blob = await createPngBlob(canvas, dpi);
        }
        if (shouldDownload) {
          await triggerDownloadBlob(blob, filename);
        }

        if (countsAsFreePreview) {
          reportExportSuccess(nextCount, exportParams);
          registerSuccessfulExport(nextCount);
        }
        dispatch({ type: "SET_EXPORT_STATUS", exporting: false });
        return blob;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Export failed.";
        trackEvent("export_failed", { format: effectiveFormat, reason: message });
        dispatch({ type: "SET_EXPORT_STATUS", exporting: false, error: message });
        return null;
      }
    },
    [
      mapRef,
      form,
      effectiveTheme,
      dispatch,
      hasVisibleMarkers,
      hasVisibleOverlays,
      visibleRoutes,
      registerSuccessfulExport,
      state.markers,
      state.customMarkerIcons,
    ],
  );

  // Free path: low-res, watermarked, PNG only — full-quality PDF/SVG are no
  // longer given away for free (see previewWatermark.ts / decision log in
  // the Fase 3 plan). Paid exports go through exportPoster("png", { preview:
  // false, download: false }) directly from the checkout flow instead.
  const exportPreview = useCallback(
    () => exportPoster("png", { quality: "preview" }),
    [exportPoster],
  );

  return {
    isExporting: state.isExporting,
    exportPoster,
    exportPreview,
  };
}
