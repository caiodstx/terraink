import { fetchAdapter } from "@/core/http/fetchAdapter";
import { API_BASE_URL } from "@/core/config";
import type { CatalogResponse } from "../domain/types";

export async function fetchCatalog(): Promise<CatalogResponse> {
  const res = await fetchAdapter.get(`${API_BASE_URL}/catalog`);
  if (!res.ok) {
    throw new Error(`No se pudo cargar el catálogo (${res.status}).`);
  }
  return res.json();
}

export interface UploadDesignResult {
  designId: string;
  format: string;
}

export async function uploadDesign(blob: Blob): Promise<UploadDesignResult> {
  const res = await fetchAdapter.post(`${API_BASE_URL}/designs`, blob, {
    headers: { "Content-Type": "image/png" },
  });
  if (!res.ok) {
    throw new Error(`No se pudo subir el diseño (${res.status}).`);
  }
  return res.json();
}

export interface CheckoutSessionResult {
  url: string;
}

export async function createCheckoutSession(
  designId: string,
  format: string,
  variantId: string,
): Promise<CheckoutSessionResult> {
  const res = await fetchAdapter.post(
    `${API_BASE_URL}/checkout`,
    JSON.stringify({ designId, format, variantId }),
    { headers: { "Content-Type": "application/json" } },
  );
  if (!res.ok) {
    throw new Error(`No se pudo iniciar el pago (${res.status}).`);
  }
  return res.json();
}
