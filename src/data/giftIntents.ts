// Single source of truth for the occasion-intent landing pages
// (/regalo-aniversario, etc.) — imported both by the Vite app
// (LandingPage.tsx) and by scripts/generate-city-pages.mjs (bun imports
// .ts directly). Mirrors src/data/cities.ts's reasoning.
export interface GiftIntent {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  pitch: string;
  // Which of the 3 real room-photo mockups (Madrid/Barcelona/Gijón)
  // illustrates this page — showing the poster in context matters more
  // here than the map detail itself, since the pitch is "as a gift".
  mockupSlug: "madrid" | "barcelona" | "gijon";
  teaser: string;
}

export const GIFT_INTENTS: GiftIntent[] = [
  {
    slug: "regalo-aniversario",
    title: "El regalo de aniversario que no se repite",
    metaTitle: "Regalo de aniversario original: póster de mapa personalizado | Mapagrama",
    description:
      "Un póster de mapa personalizado, del lugar donde os conocisteis, os casasteis o vivisteis juntos, es un regalo de aniversario que de verdad significa algo — no otro objeto genérico.",
    pitch:
      "Dónde os disteis el primer beso, dónde os casasteis, la ciudad en la que empezasteis vuestra vida juntos. Elige el lugar, los colores y el texto, y conviértelo en un póster que cuenta vuestra historia — no un regalo genérico de aniversario.",
    mockupSlug: "barcelona",
    teaser: "El lugar donde empezó todo, convertido en póster.",
  },
  {
    slug: "regalo-pareja",
    title: "Un regalo original para tu pareja",
    metaTitle: "Regalo original para tu pareja: póster de mapa personalizado | Mapagrama",
    description:
      "Si ya tiene de todo, un póster de mapa de un lugar que significa algo para los dos es un regalo de pareja original, personal y con producción en España.",
    pitch:
      "No hace falta que sea una fecha señalada — un mapa de la ciudad donde os conocisteis, de vuestro barrio, o del viaje que nunca olvidaréis es un regalo de pareja que no se le va a ocurrir a nadie más porque lo diseñas tú, no lo eliges de un catálogo.",
    mockupSlug: "madrid",
    teaser: "Un regalo que nadie más va a tener.",
  },
  {
    slug: "regalo-mudanza",
    title: "El regalo perfecto para una mudanza o casa nueva",
    metaTitle: "Regalo de mudanza o casa nueva: póster de mapa personalizado | Mapagrama",
    description:
      "Da la bienvenida a su nueva casa con un póster del mapa de su nuevo barrio o ciudad — un regalo de mudanza personal, útil para decorar, y con producción en España.",
    pitch:
      "Empezar en un barrio o ciudad nuevos da vértigo — un póster con el mapa de su nueva casa, personalizado con los colores que quieras, es un regalo de mudanza que además decora la pared que todavía tienen vacía.",
    mockupSlug: "gijon",
    teaser: "Para dar la bienvenida a su nueva casa.",
  },
];
