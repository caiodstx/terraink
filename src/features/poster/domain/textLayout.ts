/**
 * Shared poster text layout constants and pure helpers used by both the live
 * preview overlay and the export canvas renderer.
 */
import { parseHex } from "@/shared/utils/color";
export const TEXT_DIMENSION_REFERENCE_PX = 3600;

export const TEXT_CITY_Y_RATIO = 0.845;
export const TEXT_DIVIDER_Y_RATIO = 0.875;
export const TEXT_COUNTRY_Y_RATIO = 0.9;
export const TEXT_COORDS_Y_RATIO = 0.93;

/** Optional dedication/date line — sits in the gap between coordinates and
 *  the (mandatory, never move it) OSM attribution below. */
export const TEXT_DEDICATION_Y_RATIO = 0.9475;

/** OSM attribution sits centered inside the typographic block, under the
 *  coordinates line, rather than isolated in a loose corner. */
export const TEXT_ATTRIBUTION_Y_RATIO = 0.965;

/** Margin from the edges for the (optional) app credit line. */
export const TEXT_EDGE_MARGIN_RATIO = 0.02;

/** Fixed low-contrast opacity for the OSM attribution — legible up close,
 *  but visually part of the design rather than a standalone banner.
 *  Deliberately below the dedication/coordinates lines' 0.75 (feedback
 *  2026-07-24: attribution was reading more prominent than the actual
 *  personal content above it) — still well within ODbL's "legible up
 *  close" requirement, just not the most prominent line in the block. */
export const ATTRIBUTION_OPACITY = 0.48;

/** City text scales down when labels get long. */
export const CITY_TEXT_SHRINK_THRESHOLD = 10;

export const CITY_FONT_BASE_PX = 250;
export const CITY_FONT_MIN_PX = 110;
export const COUNTRY_FONT_BASE_PX = 92;
export const COORDS_FONT_BASE_PX = 58;
export const DEDICATION_FONT_BASE_PX = 46;
export const ATTRIBUTION_FONT_BASE_PX = 42;

export function isLatinScript(text: string | undefined | null): boolean {
  if (!text) {
    return true;
  }

  let latinCount = 0;
  let alphaCount = 0;

  for (const char of text) {
    if (/[A-Za-z\u00C0-\u024F]/.test(char)) {
      latinCount += 1;
      alphaCount += 1;
    } else if (/\p{L}/u.test(char)) {
      alphaCount += 1;
    }
  }

  if (alphaCount === 0) {
    return true;
  }

  return latinCount / alphaCount > 0.8;
}

export function formatCityLabel(city: string): string {
  return isLatinScript(city) ? city.toUpperCase().split("").join("  ") : city;
}

/**
 * Returns a multiplier (≤1) to shrink the city font for long names.
 * Callers apply it to their own base font size.
 */
export function computeCityFontScale(city: string): number {
  const len = Math.max(city.length, 1);
  if (len <= CITY_TEXT_SHRINK_THRESHOLD) {
    return 1;
  }
  return Math.max(
    CITY_FONT_MIN_PX / CITY_FONT_BASE_PX,
    CITY_TEXT_SHRINK_THRESHOLD / len,
  );
}

/**
 * Determines the correct attribution text colour.
 * When markers are shown the text colour is used directly;
 * otherwise a light/dark safe colour is derived from the land luminance.
 */
export function computeAttributionColor(
  textColor: string,
  landHex: string,
  showOverlay: boolean,
): string {
  if (showOverlay) {
    return textColor;
  }
  const landRgb = parseHex(landHex);
  const luma = landRgb
    ? (0.2126 * landRgb.r + 0.7152 * landRgb.g + 0.0722 * landRgb.b) / 255
    : 0.5;
  return luma < 0.52 ? "#f5faff" : "#0e1822";
}
