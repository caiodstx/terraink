import type { FrameColor, PosterKind } from "../domain/types";
import { FRAME_TEXTURE_URL } from "../domain/frameAssets";

export type PreviewViewMode = "front" | "wall";

interface PosterFramePreviewProps {
  thumbnailUrl: string | null;
  kind: PosterKind;
  frameColor: FrameColor;
  viewMode: PreviewViewMode;
}

// Live preview for BuyModal — the real design (useDesignThumbnail's export,
// same pipeline as the purchase file, just low-res) shown large, with a
// realistic frame composited via border-image (mitered corners from an
// actual texture asset, not a flat CSS border/gradient — see
// domain/frameAssets.ts for where to swap in real photography later).
export default function PosterFramePreview({
  thumbnailUrl,
  kind,
  frameColor,
  viewMode,
}: PosterFramePreviewProps) {
  const isFramed = kind === "framed";
  const textureUrl = FRAME_TEXTURE_URL[frameColor];

  return (
    <div className={`poster-preview-stage${viewMode === "wall" ? " is-wall" : ""}`}>
      <div
        className={`poster-preview-frame${isFramed ? " is-framed" : ""}`}
        style={
          isFramed
            ? ({ "--frame-texture": `url(${textureUrl})` } as React.CSSProperties)
            : undefined
        }
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Vista previa de tu diseño" />
        ) : (
          <span className="poster-preview-loading">Generando vista previa…</span>
        )}
      </div>
    </div>
  );
}
