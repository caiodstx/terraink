import type { FrameColor } from "../domain/types";
import { FRAME_SELECTOR_URL, FRAME_COLOR_LABEL, FRAME_COLOR_TAGLINE } from "../domain/frameAssets";

// Kept for external callers that only need the flat swatch color (none
// currently do, but cheap to keep) — the card itself now shows a real
// corner crop of the texture instead.
export const FRAME_COLOR_SWATCH: Record<FrameColor, string> = {
  "natural-wood": "#c9a26b",
  black: "#1a1a1a",
  gold: "#c9a227",
};

interface FrameColorCardProps {
  frameColor: FrameColor;
  isSelected: boolean;
  onClick: () => void;
}

export default function FrameColorCard({
  frameColor,
  isSelected,
  onClick,
}: FrameColorCardProps) {
  const className = ["buy-modal-frame-card", isSelected ? "is-selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={FRAME_COLOR_LABEL[frameColor]}
    >
      <span
        className="buy-modal-frame-card-swatch"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${FRAME_SELECTOR_URL[frameColor]})`,
        }}
      />
      {isSelected ? (
        <span className="buy-modal-frame-card-check" aria-hidden="true">
          ✓
        </span>
      ) : null}
      <p className="buy-modal-frame-card-name">{FRAME_COLOR_LABEL[frameColor]}</p>
      <p className="buy-modal-frame-card-tagline">{FRAME_COLOR_TAGLINE[frameColor]}</p>
    </button>
  );
}
