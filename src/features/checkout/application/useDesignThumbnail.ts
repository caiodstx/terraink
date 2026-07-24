import { useEffect, useState } from "react";
import { useExport } from "@/features/export/application/useExport";

/** Low-res, unwatermarked snapshot of the current design — for UI chrome
 * like the frame-color mockup in the buy modal, never for saving/download. */
export function useDesignThumbnail(enabled: boolean): string | null {
  const { exportPoster } = useExport();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;
    let objectUrl: string | null = null;

    void exportPoster("png", { quality: "thumbnail", download: false }).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [enabled, exportPoster]);

  return url;
}
