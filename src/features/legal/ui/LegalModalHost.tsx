import { lazy, Suspense, useEffect, useState } from "react";
import {
  LEGAL_DOC_EVENT,
  type LegalDocDetail,
  type LegalDocType,
} from "@/features/legal/application/legalDoc";

const LegalModal = lazy(() => import("@/features/legal/ui/LegalModal"));

/**
 * Listens for the legal-doc-open event site-wide (mounted once in App.tsx,
 * outside the router) so footer links work on every page — not just inside
 * the editor, which is just one route among several.
 */
export default function LegalModalHost() {
  const [legalDoc, setLegalDoc] = useState<LegalDocType | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setLegalDoc((e as CustomEvent<LegalDocDetail>).detail.doc);
    };
    window.addEventListener(LEGAL_DOC_EVENT, handler);
    return () => window.removeEventListener(LEGAL_DOC_EVENT, handler);
  }, []);

  if (!legalDoc) return null;

  return (
    <Suspense fallback={null}>
      <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />
    </Suspense>
  );
}
