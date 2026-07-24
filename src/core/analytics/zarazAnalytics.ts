/**
 * Minimal Cloudflare Zaraz event wrapper.
 *
 * Zaraz's client library is injected automatically at the Cloudflare edge
 * once enabled for the zone — no script tag needed here. It's cookieless
 * by default, so this needs no consent-banner gating (unlike the GA4 wrapper
 * this replaces, which was wired but never actually activated — no real
 * VITE_GA_MEASUREMENT_ID was ever set). Fails silently — analytics must
 * never break the app (and Zaraz itself may be absent when blocked, or on
 * localhost where the edge injection doesn't happen).
 *
 * Each trackEvent() call needs a matching Trigger + Action configured in the
 * Cloudflare Zaraz dashboard (Action: "Custom HTTP Request" to
 * POST /api/events) for it to actually reach mapagrama-api's funnel table —
 * see CLAUDE.md.
 */
type AnalyticsParams = Record<string, string | number | boolean>;

interface ZarazApi {
  track: (eventName: string, eventProperties?: AnalyticsParams) => void;
  set: (key: string, value: unknown, options?: { scope?: string }) => void;
}

function getZaraz(): ZarazApi | null {
  const zaraz = (window as unknown as { zaraz?: ZarazApi }).zaraz;
  return zaraz && typeof zaraz.track === "function" ? zaraz : null;
}

export function trackEvent(name: string, params?: AnalyticsParams): void {
  const zaraz = getZaraz();
  if (!zaraz) return;
  try {
    zaraz.track(name, params);
  } catch {
    // ignore
  }
}

/**
 * Attaches a variable to subsequent zaraz.track() calls on this page load.
 * Unlike GA4 user properties, Zaraz has no persistent (cross-session,
 * cookieless) identity to attach this to — this is best-effort, current-page
 * context only (e.g. "lifetime_export_count so far this session").
 */
export function setUserProperty(name: string, value: AnalyticsParams[string]): void {
  const zaraz = getZaraz();
  if (!zaraz) return;
  try {
    zaraz.set(name, value);
  } catch {
    // ignore
  }
}
