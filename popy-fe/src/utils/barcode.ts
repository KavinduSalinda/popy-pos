/** Max length aligned with backend Product.barcode field. */
export const BARCODE_MAX_LENGTH = 60;

/**
 * Generates a unique internal barcode (CODE128-compatible alphanumeric).
 * Not a certified EAN-13; suitable for in-store scanning.
 */
export const generateProductBarcode = (sku?: string): string => {
  const ts = Date.now()
    .toString(36)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();

  if (sku) {
    const base = sku
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .slice(0, 12);
    if (base.length >= 3) {
      return `${base}${ts.slice(-6)}${rand}`.slice(0, BARCODE_MAX_LENGTH);
    }
  }

  return `POPY${ts.slice(-8)}${rand}`.slice(0, BARCODE_MAX_LENGTH);
};

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
