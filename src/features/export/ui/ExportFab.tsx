import { useEffect, useState } from "react";
import { useExport } from "@/features/export/application/useExport";
import { DownloadIcon, LoaderIcon } from "@/shared/ui/Icons";

interface ExportFabProps {
  isMobile: boolean;
}

export default function ExportFab({ isMobile }: ExportFabProps) {
  const { isExporting, exportPreview } = useExport();
  const [isTriggerVisible, setIsTriggerVisible] = useState(true);

  useEffect(() => {
    if (!isMobile) return;

    const FOOTER_OVERLAP_THRESHOLD_PX = 140;

    const updateVisibility = () => {
      const doc = document.documentElement;
      const scrolledToBottom =
        window.scrollY + window.innerHeight >=
        doc.scrollHeight - FOOTER_OVERLAP_THRESHOLD_PX;
      setIsTriggerVisible(!scrolledToBottom);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [isMobile]);

  const triggerClass = isMobile
    ? `mobile-export-fab-trigger${isTriggerVisible ? "" : " is-hidden"}`
    : "export-fab-trigger-desktop";

  return (
    <button
      type="button"
      className={triggerClass}
      aria-label="Vista previa gratuita (baja resolución, con marca de agua)"
      title="Vista previa gratuita (baja resolución, con marca de agua)"
      onClick={() => void exportPreview()}
      disabled={isExporting}
      tabIndex={isMobile && !isTriggerVisible ? -1 : 0}
      aria-hidden={isMobile && !isTriggerVisible}
    >
      {isExporting ? (
        <LoaderIcon className="is-spinning" />
      ) : (
        <DownloadIcon />
      )}
      {!isMobile && <span>Vista previa</span>}
    </button>
  );
}
