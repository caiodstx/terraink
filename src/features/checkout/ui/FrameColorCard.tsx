import type { FrameColor } from "../domain/types";

export const FRAME_COLOR_SWATCH: Record<FrameColor, string> = {
  "natural-wood": "#c9a26b",
  black: "#1a1a1a",
  gold: "#c9a227",
};

const FRAME_COLOR_LABEL: Record<FrameColor, string> = {
  "natural-wood": "Madera natural",
  black: "Negro",
  gold: "Dorado",
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
  const className = ["theme-card", isSelected ? "is-selected" : ""]
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
      <div className="theme-card-palette" aria-hidden="true">
        <span
          className="theme-card-swatch"
          style={{ backgroundColor: FRAME_COLOR_SWATCH[frameColor] }}
          title={FRAME_COLOR_LABEL[frameColor]}
        />
      </div>
      <span className="theme-card-name-shadow" aria-hidden="true" />
      <p className="theme-card-name">{FRAME_COLOR_LABEL[frameColor]}</p>
    </button>
  );
}
