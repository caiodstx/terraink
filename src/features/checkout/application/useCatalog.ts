import { useEffect, useState } from "react";
import { fetchCatalog } from "../infrastructure/checkoutApi";
import type { CatalogVariant } from "../domain/types";

export function useCatalog(enabled: boolean) {
  const [variants, setVariants] = useState<CatalogVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || variants.length > 0) return;
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    fetchCatalog()
      .then((data) => {
        if (!cancelled) setVariants(data.variants);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar el catálogo.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, variants.length]);

  return { variants, isLoading, error };
}
