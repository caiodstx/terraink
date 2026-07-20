export type LegalDocType = "privacy" | "imprint";

export const LEGAL_DOC_EVENT = "mapagrama:legal-doc";

export interface LegalDocDetail {
  doc: LegalDocType;
}

/** Open the in-app legal modal for the given document. */
export function openLegalDoc(doc: LegalDocType): void {
  window.dispatchEvent(
    new CustomEvent<LegalDocDetail>(LEGAL_DOC_EVENT, { detail: { doc } }),
  );
}
