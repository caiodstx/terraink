export type PosterKind = "poster" | "framed";
export type FrameColor = "natural-wood" | "black" | "gold";

export interface CatalogVariant {
  id: string;
  label: string;
  priceCents: number;
  currency: string;
  frameColor?: FrameColor;
}

export interface CatalogResponse {
  variants: CatalogVariant[];
}
