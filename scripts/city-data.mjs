// City list for the pre-rendered SEO landing pages (see
// generate-city-pages.mjs). Coordinates are approximate city centers.
// `hasExample: true` means a real poster export exists at
// public/assets/examples/{slug}.jpg + mockups/{slug}.jpg — others fall
// back to the decorative placeholder pattern used elsewhere on the site.
export const CITIES = [
  { slug: "madrid", name: "Madrid", region: "Comunidad de Madrid", lat: 40.4168, lon: -3.7038, hasExample: true },
  { slug: "barcelona", name: "Barcelona", region: "Cataluña", lat: 41.3874, lon: 2.1686, hasExample: true },
  { slug: "valencia", name: "Valencia", region: "Comunidad Valenciana", lat: 39.4699, lon: -0.3763, hasExample: false },
  { slug: "sevilla", name: "Sevilla", region: "Andalucía", lat: 37.3891, lon: -5.9845, hasExample: false },
  { slug: "zaragoza", name: "Zaragoza", region: "Aragón", lat: 41.6488, lon: -0.8891, hasExample: false },
  { slug: "malaga", name: "Málaga", region: "Andalucía", lat: 36.7213, lon: -4.4213, hasExample: false },
  { slug: "bilbao", name: "Bilbao", region: "País Vasco", lat: 43.263, lon: -2.935, hasExample: false },
  { slug: "gijon", name: "Gijón", region: "Asturias", lat: 43.5322, lon: -5.6611, hasExample: true },
  { slug: "murcia", name: "Murcia", region: "Región de Murcia", lat: 37.9922, lon: -1.1307, hasExample: false },
  { slug: "vigo", name: "Vigo", region: "Galicia", lat: 42.2406, lon: -8.7207, hasExample: false },
];
