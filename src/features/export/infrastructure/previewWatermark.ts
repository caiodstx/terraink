const WATERMARK_TEXT = "MAPAGRAMA — VISTA PREVIA";

/**
 * Tiles a semi-transparent diagonal watermark across the canvas, in place.
 * Used only for the free preview export — never for a paid purchase render.
 */
export function applyPreviewWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const fontSize = Math.round(width * 0.045);
  const stepY = fontSize * 3.2;
  const stepX = fontSize * (WATERMARK_TEXT.length * 0.32);
  const diagonal = Math.sqrt(width * width + height * height);
  const rows = Math.ceil(diagonal / stepY) + 2;
  const cols = Math.ceil(diagonal / stepX) + 2;

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = `700 ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = Math.max(1, width * 0.0015);

  for (let row = -rows; row <= rows; row += 1) {
    const offsetX = row % 2 === 0 ? 0 : stepX / 2;
    for (let col = -cols; col <= cols; col += 1) {
      const x = col * stepX + offsetX;
      const y = row * stepY;
      ctx.strokeText(WATERMARK_TEXT, x, y);
      ctx.fillText(WATERMARK_TEXT, x, y);
    }
  }

  ctx.restore();
}
