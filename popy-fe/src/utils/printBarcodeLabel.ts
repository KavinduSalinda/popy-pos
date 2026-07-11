import JsBarcode from 'jsbarcode';
import { escapeHtml } from './barcode';

export interface BarcodeLabelOptions {
  barcode: string;
  title: string;
  subtitle?: string;
}

const renderBarcodeDataUrl = (barcode: string): string => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, barcode, {
    format: 'CODE128',
    width: 2,
    height: 72,
    displayValue: true,
    fontSize: 14,
    margin: 8,
  });
  return canvas.toDataURL('image/png');
};

export const getBarcodeLabelDataUrl = (barcode: string): string | null => {
  const code = barcode.trim();
  if (!code) return null;
  try {
    return renderBarcodeDataUrl(code);
  } catch {
    return null;
  }
};

const buildLabelHtml = (
  { title, subtitle }: Omit<BarcodeLabelOptions, 'barcode'>,
  dataUrl: string,
  code: string,
): string => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Barcode — ${escapeHtml(title)}</title>
    <style>
      body { font-family: system-ui, sans-serif; text-align: center; margin: 24px; }
      h1 { font-size: 16px; margin: 0 0 4px; font-weight: 600; }
      p { font-size: 12px; margin: 0 0 16px; color: #444; }
      img { max-width: 100%; height: auto; }
      @media print { body { margin: 12px; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
    <img src="${dataUrl}" alt="Barcode ${escapeHtml(code)}" />
  </body>
</html>`;

/** Prints via a hidden iframe (no pop-up window required). */
const printHtmlInIframe = (html: string): boolean => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Barcode print');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    iframe.remove();
  };

  const triggerPrint = () => {
    win.focus();
    win.print();
    win.addEventListener('afterprint', cleanup, { once: true });
    window.setTimeout(cleanup, 5000);
  };

  const img = doc.querySelector('img');
  if (img && !img.complete) {
    img.onload = () => window.setTimeout(triggerPrint, 50);
    img.onerror = cleanup;
  } else {
    window.setTimeout(triggerPrint, 100);
  }

  return true;
};

/**
 * Prints a CODE128 label using a hidden iframe (works without pop-ups).
 */
export const printBarcodeLabel = ({
  barcode,
  title,
  subtitle,
}: BarcodeLabelOptions): boolean => {
  const code = barcode.trim();
  if (!code) return false;

  const dataUrl = getBarcodeLabelDataUrl(code);
  if (!dataUrl) return false;

  return printHtmlInIframe(buildLabelHtml({ title, subtitle }, dataUrl, code));
};
