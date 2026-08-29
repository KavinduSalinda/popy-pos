import { APP_CONFIG } from '@/constants';
import { escapeHtml } from '@/utils/barcode';
import { formatCurrency, formatDateTime, toNumber } from '@/utils/format';
import type { PaymentMethod, Sale } from '../types';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  MOBILE: 'Mobile',
  CREDIT: 'Credit',
};

export interface SalePaymentSummary {
  amountPaid: number;
  total: number;
  change: number;
  balanceDue: number;
}

export const getSalePaymentSummary = (sale: Sale): SalePaymentSummary => {
  const total = toNumber(sale.total);
  const amountPaid = toNumber(sale.amountPaid ?? sale.total);
  return {
    amountPaid,
    total,
    change: Math.max(0, amountPaid - total),
    balanceDue: Math.max(0, total - amountPaid),
  };
};

export const formatPaymentMethod = (method: PaymentMethod): string =>
  PAYMENT_LABELS[method] ?? method;

export const getReceiptShopName = (sale: Sale, fallback?: string | null): string =>
  sale.shopName?.trim() || fallback?.trim() || APP_CONFIG.name;

export const getReceiptShopPhone = (
  sale: Sale,
  fallback?: string | null,
): string => sale.shopPhone?.trim() || fallback?.trim() || '';

const receiptRow = (label: string, value: string, bold = false) =>
  `<div class="row${bold ? ' bold' : ''}"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;

export const buildReceiptHtml = (
  sale: Sale,
  shopName?: string | null,
  shopPhone?: string | null,
): string => {
  const { amountPaid, change, balanceDue } = getSalePaymentSummary(sale);
  const hotline = getReceiptShopPhone(sale, shopPhone);
  const hotlineHtml = hotline
    ? `<p>Hotline: ${escapeHtml(hotline)}</p>`
    : '';
  const itemsHtml = sale.items
    .map((item) => {
      const sku = item.sku?.trim()
        ? `<div class="sku">${escapeHtml(item.sku)}</div>`
        : '';
      return `<div class="item">
        <div class="row"><span>${item.quantity} × ${escapeHtml(item.productName)}</span><span>${escapeHtml(formatCurrency(item.total))}</span></div>
        ${sku}
      </div>`;
    })
    .join('');

  const paymentRows = [
    receiptRow('Subtotal', formatCurrency(sale.subtotal)),
    receiptRow('Discount', `- ${formatCurrency(sale.discount)}`),
    receiptRow('Tax', formatCurrency(sale.tax)),
    '<div class="divider"></div>',
    receiptRow('Total', formatCurrency(sale.total), true),
    receiptRow('Amount paid', formatCurrency(amountPaid)),
    ...(change > 0 ? [receiptRow('Balance', formatCurrency(change))] : []),
    ...(balanceDue > 0
      ? [receiptRow('Balance due', formatCurrency(balanceDue))]
      : []),
    receiptRow('Payment', formatPaymentMethod(sale.paymentMethod)),
  ].join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${escapeHtml(sale.reference)}</title>
    <style>
      body {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.4;
        margin: 12px auto;
        max-width: 320px;
        color: #111;
      }
      .header { text-align: center; margin-bottom: 8px; }
      .header h1 { font-size: 16px; margin: 0 0 4px; }
      .header p { margin: 2px 0; font-size: 11px; color: #444; }
      .divider { border-top: 1px dashed #999; margin: 8px 0; }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin: 2px 0;
      }
      .row.bold { font-weight: 700; }
      .item { margin: 6px 0; }
      .sku { font-size: 10px; color: #666; margin: 0 0 2px; }
      .footer { text-align: center; margin-top: 8px; font-size: 11px; }
      @media print { body { margin: 8px auto; } }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${escapeHtml(getReceiptShopName(sale, shopName))}</h1>
      <p>${escapeHtml(sale.reference)}</p>
      <p>${escapeHtml(formatDateTime(sale.createdAt))}</p>
    </div>
    <div class="divider"></div>
    ${itemsHtml}
    <div class="divider"></div>
    ${paymentRows}
    <div class="divider"></div>
    <p class="footer">Thank you for your purchase!</p>
    <p class="footer">Hotline: ${escapeHtml(hotline)}</p>
  </body>
</html>`;
};

const printHtmlInIframe = (html: string): boolean => {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Receipt print');
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

  window.setTimeout(triggerPrint, 50);
  return true;
};

export const printSaleReceipt = (
  sale: Sale,
  shopName?: string | null,
  shopPhone?: string | null,
): boolean => printHtmlInIframe(buildReceiptHtml(sale, shopName, shopPhone));
