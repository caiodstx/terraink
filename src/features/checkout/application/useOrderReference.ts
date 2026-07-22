import { useEffect, useState } from "react";
import { fetchOrderReference } from "../infrastructure/checkoutApi";

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 6;

// The Stripe webhook that creates the order runs async, so right after the
// redirect back from Checkout the order may not exist yet — poll briefly
// instead of failing immediately.
export function useOrderReference(sessionId: string | null) {
  const [reference, setReference] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sessionId));

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = () => {
      attempts += 1;
      fetchOrderReference(sessionId)
        .then((result) => {
          if (cancelled) return;
          if (result.found && result.reference) {
            setReference(result.reference);
            setIsLoading(false);
            return;
          }
          if (attempts >= MAX_ATTEMPTS) {
            setIsLoading(false);
            return;
          }
          setTimeout(poll, POLL_INTERVAL_MS);
        })
        .catch(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { reference, isLoading };
}
