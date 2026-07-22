export interface CityDeepLink {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

// Deep link from a city SEO landing page (see
// scripts/generate-city-pages.mjs's CTA hrefs, e.g. /crear?lat=...&lon=...
// &city=Valencia&country=Espa%C3%B1a). Read by both useGeolocation (to skip
// the browser geolocation prompt and init the map there) and
// StartupLocationModal (to skip the "choose a location" prompt entirely) —
// someone clicking "diseñar mi póster de Valencia" wants Valencia, not a
// prompt asking them to pick a location again.
export function readCityDeepLink(): CityDeepLink | null {
  const params = new URLSearchParams(window.location.search);
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const city = params.get("city");
  const country = params.get("country");
  if (!city || !country || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { lat, lon, city, country };
}
