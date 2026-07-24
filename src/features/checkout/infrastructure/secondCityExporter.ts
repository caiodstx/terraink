import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import type { ResolvedTheme } from "@/features/theme/domain/types";
import { createOffscreenContainer, waitForMapIdle } from "@/features/export/infrastructure/exportUtils";
import { compositeExport } from "@/features/poster/infrastructure/renderer";
import { resolveCanvasSize } from "@/features/poster/infrastructure/renderer/canvas";
import { distanceToZoom } from "@/features/map/application/useMapSync";
import { createPngBlob } from "@/core/services";
import { CM_PER_INCH, DEFAULT_CONTAINER_PX } from "@/core/config";

const PURCHASE_DPI = 300;

export interface SecondCityTarget {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

export interface SecondCityExportParams {
  style: StyleSpecification;
  theme: ResolvedTheme;
  distanceMeters: number;
  widthCm: number;
  heightCm: number;
  fontFamily: string;
  showPosterText: boolean;
  includeCredits: boolean;
}

// Renders a full purchase-quality poster for a *different* city, same
// theme/size/customization as whatever's currently on screen — the "second
// city -20%" upsell in BuyModal. Deliberately never touches the live map
// (mapRef) or PosterContext state: this spins up its own independent
// offscreen MapLibre instance (same pattern as mapExporter.ts's
// captureMapAsCanvas, just without depending on an existing live map to
// read center/zoom/style off of), so a slow render or a failure here can
// never disturb the design the customer is actually editing.
export async function exportSecondCityPoster(
  target: SecondCityTarget,
  params: SecondCityExportParams,
): Promise<Blob> {
  // DEFAULT_CONTAINER_PX rather than the live preview's actual measured
  // container width: this map never appears on screen, so there's no real
  // container size to match — it only needs to be a stable, deterministic
  // input to distanceToZoom so the second poster's framing looks
  // consistent with the first (same distanceMeters "zoom level"), not an
  // exact pixel match.
  const zoom = distanceToZoom(params.distanceMeters, target.lat, DEFAULT_CONTAINER_PX);
  const widthInches = params.widthCm / CM_PER_INCH;
  const heightInches = params.heightCm / CM_PER_INCH;
  const size = resolveCanvasSize(widthInches, heightInches, PURCHASE_DPI);

  const offscreenContainer = createOffscreenContainer(size.width, size.height);
  document.body.appendChild(offscreenContainer);
  const exportMap = new maplibregl.Map({
    container: offscreenContainer,
    style: params.style,
    center: [target.lon, target.lat],
    zoom,
    interactive: false,
    attributionControl: false,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });

  let mapCanvas: HTMLCanvasElement;
  try {
    await waitForMapIdle(exportMap);
    const glCanvas = exportMap.getCanvas();
    mapCanvas = document.createElement("canvas");
    mapCanvas.width = size.width;
    mapCanvas.height = size.height;
    const ctx = mapCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create 2D context for the second poster's export canvas");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(glCanvas, 0, 0, size.width, size.height);
  } finally {
    exportMap.remove();
    offscreenContainer.remove();
  }

  const { canvas } = await compositeExport(mapCanvas, {
    theme: params.theme,
    center: { lat: target.lat, lon: target.lon },
    widthInches,
    heightInches,
    displayCity: target.city,
    displayCountry: target.country,
    fontFamily: params.fontFamily,
    showPosterText: params.showPosterText,
    // No markers/routes on the second poster — those are specific to the
    // primary design the customer built by hand, not something to copy
    // onto a city they've never actually placed a pin on.
    showOverlay: false,
    includeCredits: params.includeCredits,
  });

  return createPngBlob(canvas, PURCHASE_DPI);
}
