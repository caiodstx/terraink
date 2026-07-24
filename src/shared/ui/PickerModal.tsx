import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PickerModalProps {
  open: boolean;
  title: string;
  titleId?: string;
  onClose: () => void;
  doneLabel?: string;
  children: ReactNode;
  /** Wider layout for content that needs room (e.g. BuyModal's 2-column
   *  preview+options) — other callers keep the default compact width. */
  wide?: boolean;
  /** Hides the footer "Done" button — for modals where the header's X is
   *  already the only close affordance the design calls for. */
  hideFooter?: boolean;
  /** Custom footer content rendered outside the scrollable body (e.g.
   *  BuyModal's price + CTA) — takes precedence over the default "Done"
   *  button and over hideFooter. Stays visible without scrolling. */
  footer?: ReactNode;
}

export default function PickerModal({
  open,
  title,
  titleId,
  onClose,
  doneLabel = "Done",
  children,
  wide = false,
  hideFooter = false,
  footer,
}: PickerModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const resolvedTitleId = titleId || "picker-modal-title";

  const modalMarkup = (
    <div
      className="picker-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`picker-modal${wide ? " picker-modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={resolvedTitleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="picker-modal-header">
          <h3 id={resolvedTitleId}>{title}</h3>
          <button
            type="button"
            className="picker-modal-close"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            x
          </button>
        </div>

        <div className="picker-modal-body">{children}</div>

        {footer ? (
          <div className="picker-modal-custom-footer">{footer}</div>
        ) : hideFooter ? null : (
          <div className="picker-modal-footer">
            <button type="button" className="picker-modal-done" onClick={onClose}>
              {doneLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
}
