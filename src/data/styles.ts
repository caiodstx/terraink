// Single source of truth for the /estilo/<slug> SEO landing pages —
// imported both by the Vite app (LandingPage.tsx) and by
// scripts/generate-city-pages.mjs (bun imports .ts directly). Mirrors
// src/data/giftIntents.ts's reasoning.
//
// A curated subset of 8, not the full catalog: the editor already ships
// ~27 named themes (src/data/themes.json + additional_themes.json) —
// this isn't about creating new presets, it's about which ones get a
// dedicated marketing page and get featured as quick-start options.
// `themeId` must match an id in one of those two files.
export interface StyleIntent {
  slug: string;
  themeId: string;
  name: string;
  title: string;
  metaTitle: string;
  description: string;
  pitch: string;
  teaser: string;
}

export const STYLES: StyleIntent[] = [
  {
    slug: "midnight-blue",
    themeId: "midnight_blue",
    name: "Midnight Blue",
    title: "Póster de mapa estilo Midnight Blue",
    metaTitle: "Póster de mapa estilo Midnight Blue | Mapagrama",
    description:
      "El estilo insignia de Mapagrama: fondo azul noche profundo y callejero en dorado, el aspecto de atlas de lujo que ves en nuestros ejemplos. Personalízalo con tu ciudad.",
    pitch:
      "Azul noche profundo, calles en dorado, tipografía elegante bajo las coordenadas — es el estilo que más pedimos, y el que aparece en casi todos nuestros ejemplos. Funciona en cualquier ciudad, de capital a pueblo, y queda igual de bien en un salón que en una oficina.",
    teaser: "El azul noche y dorado que define Mapagrama.",
  },
  {
    slug: "terracota",
    themeId: "terracotta",
    name: "Terracota",
    title: "Póster de mapa estilo Terracota",
    metaTitle: "Póster de mapa estilo Terracota | Mapagrama",
    description:
      "Calidez mediterránea: tonos de barro cocido y naranja quemado sobre crema. Ideal para ciudades costeras o para quien prefiera algo más cálido que el clásico azul noche.",
    pitch:
      "Naranja quemado y arcilla sobre un fondo crema, como una tarde de verano en el Mediterráneo. Le sienta especialmente bien a ciudades costeras, pero funciona en cualquier lugar que quieras recordar con calidez en vez de con el azul noche clásico.",
    teaser: "Calidez mediterránea para tu ciudad.",
  },
  {
    slug: "carrara",
    themeId: "carrara",
    name: "Carrara",
    title: "Póster de mapa estilo Carrara",
    metaTitle: "Póster de mapa estilo Carrara (mármol blanco) | Mapagrama",
    description:
      "Mármol blanco: piedra pálida con vetas en carboncillo suave. El estilo más claro y minimalista del catálogo, para quien busca algo discreto y elegante.",
    pitch:
      "Blanco piedra con vetas suaves en carboncillo, como el mármol de Carrara que le da nombre. Es el estilo más claro y minimalista que ofrecemos — perfecto si el azul noche te parece demasiado oscuro, o si tu pared ya tiene mucho color alrededor.",
    teaser: "Mármol blanco, minimalista y elegante.",
  },
  {
    slug: "noir",
    themeId: "noir",
    name: "Noir",
    title: "Póster de mapa estilo Noir",
    metaTitle: "Póster de mapa estilo Noir (negro) | Mapagrama",
    description:
      "Negro puro con calles en blanco y gris — estética de galería de arte moderna. El contraste más fuerte del catálogo.",
    pitch:
      "Fondo negro absoluto, calles trazadas en blanco y gris — el contraste más dramático que tenemos. Queda como una pieza de galería más que como un mapa, ideal para espacios minimalistas o para quien quiere algo que de verdad destaque en la pared.",
    teaser: "El contraste más dramático del catálogo.",
  },
  {
    slug: "bosque",
    themeId: "forest",
    name: "Bosque",
    title: "Póster de mapa estilo Bosque",
    metaTitle: "Póster de mapa estilo Bosque (verde) | Mapagrama",
    description:
      "Verdes profundos y tonos salvia — estética botánica orgánica. Para quien prefiere la naturaleza al lujo urbano.",
    pitch:
      "Verdes profundos y salvia en vez de dorado y negro — un estilo botánico que sienta bien en espacios con plantas, madera natural, o simplemente para quien prefiere el verde a cualquier otra cosa. Funciona especialmente bien en ciudades con mucho parque o costa verde.",
    teaser: "Verdes profundos, estética botánica.",
  },
  {
    slug: "oceano",
    themeId: "ocean",
    name: "Océano",
    title: "Póster de mapa estilo Océano",
    metaTitle: "Póster de mapa estilo Océano (azules y turquesas) | Mapagrama",
    description:
      "Azules y turquesas variados, pensado para ciudades costeras — aunque funciona en cualquier lugar.",
    pitch:
      "Una paleta de azules y turquesas pensada para el mar — perfecto si tu ciudad tiene costa, puerto o ría, aunque no hace falta vivir cerca del agua para que te guste. Es más fresco y variado que el azul noche clásico.",
    teaser: "Azules y turquesas con aire costero.",
  },
  {
    slug: "atardecer",
    themeId: "sunset",
    name: "Atardecer",
    title: "Póster de mapa estilo Atardecer",
    metaTitle: "Póster de mapa estilo Atardecer | Mapagrama",
    description:
      "Naranjas y rosas cálidos sobre melocotón suave — estética de hora dorada, con un aire romántico.",
    pitch:
      "Naranjas y rosas cálidos, como esa media hora de luz dorada justo antes de que se ponga el sol. Es de los estilos con más aire romántico del catálogo — buena opción si el póster es un regalo de pareja o aniversario.",
    teaser: "La hora dorada, en forma de mapa.",
  },
  {
    slug: "blueprint",
    themeId: "blueprint",
    name: "Blueprint",
    title: "Póster de mapa estilo Blueprint",
    metaTitle: "Póster de mapa estilo Blueprint (plano técnico) | Mapagrama",
    description:
      "Estética de plano técnico arquitectónico — para quien prefiere algo más técnico que decorativo.",
    pitch:
      "El aspecto de un plano de arquitecto clásico — líneas técnicas sobre fondo azul plano, sin la calidez de los demás estilos a propósito. Es la opción más diferente del catálogo, ideal para arquitectos, ingenieros o cualquiera que prefiera lo técnico a lo decorativo.",
    teaser: "Estética de plano técnico, sin adornos.",
  },
];
