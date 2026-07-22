/* ────── App config constants ────── */
/* Migrated from src/constants/appConfig.js — env-independent values */

export const CM_PER_INCH = 2.54;

export const MIN_POSTER_CM = 4;
// 70cm covers the 50x70cm print size — the largest sellable poster.
export const MAX_POSTER_CM = 70;
export const DEFAULT_POSTER_WIDTH_CM = 20;
export const DEFAULT_POSTER_HEIGHT_CM = 30;
export const LAYOUT_MATCH_TOLERANCE_CM = 0.01;

export const MIN_DISTANCE_METERS = 100;
export const MAX_DISTANCE_METERS = 20_000_000;
export const DEFAULT_DISTANCE_METERS = 4_000;

/* ── Map / MapLibre ── */

/** Earth circumference at equator in meters. */
export const EARTH_CIRCUMFERENCE_M = 40_075_016.686;

/** Vector tile size for OpenMapTiles/OpenFreeMap tile scheme. */
export const TILE_SIZE_PX = 512;

/** Min zoom level allowed for the map. */
export const MIN_MAP_ZOOM = 0.5;

/** Max zoom level allowed for the map. */
export const MAX_MAP_ZOOM = 20;

/** Default container width (px) used before ResizeObserver measures the real one. */
export const DEFAULT_CONTAINER_PX = 600;

/** Duration (ms) for flyTo animation when selecting a location. */
export const FLY_TO_DURATION_MS = 1800;

/** Madrid, España — default fallback when geolocation is denied. */
export const DEFAULT_LAT = 40.4168;
export const DEFAULT_LON = -3.7038;
export const DEFAULT_CITY = "Madrid";
export const DEFAULT_COUNTRY = "España";

export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? "";

/* Base URL of mapagrama-api (private, separate repo/process — see its own
   CLAUDE.md). Defaults to "/api" to match the production nginx reverse
   proxy, which strips the prefix before forwarding. Override for local
   dev against a `bun run dev` instance of mapagrama-api. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "/api"
).replace(/\/$/, "");
/* Raw markdown URLs for the in-app legal modal. Hosted as static files on
   the R2 public bucket already used for design storage (mapagrama-api),
   under the "legal/" prefix — not tied to any release of this app. */
export const LEGAL_NOTICE_URL = import.meta.env.VITE_LEGAL_NOTICE_URL ?? "";
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL ?? "";
export const TERMS_URL = import.meta.env.VITE_TERMS_URL ?? "";
export const WITHDRAWAL_URL = import.meta.env.VITE_WITHDRAWAL_URL ?? "";

export const APP_CREDIT_URL =
  import.meta.env.VITE_APP_CREDIT_URL ?? "mapagrama.com";
export const APP_VERSION = String(
  import.meta.env.VITE_APP_VERSION ?? "0.0.0",
).trim();
export const UPDATES_URL = String(
  import.meta.env.VITE_UPDATES_URL ?? "/updates.json",
).trim();

export interface FontOption {
  value: string;
  label: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: "", label: "Default (Space Grotesk)" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Oswald", label: "Oswald" },
  { value: "Noto Sans JP", label: "Noto Sans JP" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Raleway", label: "Raleway" },
  { value: "Lato", label: "Lato" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Bebas neue", label: "Bebas Neue" },
];
