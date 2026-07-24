import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/core/services";

interface StickyMobileCtaProps {
  /** Element to watch — the bar shows only once this scrolls out of view. */
  targetRef: React.RefObject<HTMLElement>;
}

// Mobile-only (see .landing-sticky-cta's media query) — desktop never
// needs it, the hero CTA is always reachable. Hidden by construction on
// every other route: this only renders inside LandingPage, which only
// mounts at "/".
export default function StickyMobileCta({ targetRef }: StickyMobileCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  return (
    <div className={`landing-sticky-cta${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <Link
        to="/crear"
        className="landing-sticky-cta-link"
        tabIndex={visible ? 0 : -1}
        onClick={() => trackEvent("sticky_cta_click")}
      >
        Crear mi mapa — desde 29€
      </Link>
    </div>
  );
}
