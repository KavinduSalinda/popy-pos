# Point of Sale

## Overview

The POS page (`/pos`) is the primary checkout interface. Cashiers add products to a cart, optionally attach a customer, apply discounts, and complete payment.

**Access:** `POS_ACCESS` (Super Admin, Manager, Cashier)

## Layout

| Area | Purpose |
|------|---------|
| Product grid | Search and browse active products; click row or add button to cart |
| Barcode field | USB scanner or manual SKU/barcode entry |
| Cart panel | Line items, customer, discount, checkout button |
| Payment dialog | Payment method, cash tender, optional notifications, receipt |

## Adding products

1. **Click** a product row or the cart icon on the grid.
2. **Search** products by name, SKU, or barcode in the search field.
3. **Scan** a barcode — hardware wedge scanners work globally on the page; the dedicated scan field also accepts Enter after typing a code.

Barcode lookup: `GET /api/pos/products/lookup?code={skuOrBarcode}`

Product list: `GET /api/pos/products?search={query}`

## Cart

- Adjust quantity with +/- controls (capped by available stock).
- Remove items individually or clear the entire cart.
- Select an optional customer from the autocomplete (walk-in allowed).
- Enter a flat discount amount.
- Tax is calculated client-side using `VITE_TAX_RATE` (default 10%) on `(subtotal − discount)`.

## Checkout flow

```
Products → Cart → Payment dialog → Confirm → Sale created → Receipt
```

### Payment methods

| Method | Behaviour |
|--------|-----------|
| Cash | Enter amount paid; change is calculated automatically |
| Card | Full amount charged |
| Mobile | Full amount charged |
| Credit | Full amount charged |

### Customer notifications

If a customer is selected and settings allow, the cashier can toggle:

- **Send receipt email** — requires customer email, global + cashier email settings, and `POS_CHECKOUT_SEND_EMAIL`
- **Send receipt SMS** — requires customer phone, global + cashier SMS settings, and `POS_CHECKOUT_SEND_SMS`

Options are loaded from `GET /api/settings/pos-checkout-notifications`.

### Receipt

After a successful sale, the payment dialog shows a receipt preview with:

- Store name, reference, date/time
- Line items
- Subtotal, discount, tax, total
- Amount paid, balance (change when customer overpays), payment method

**Balance** on the receipt is the change returned to the customer (shown only when amount paid exceeds the total).

**Print** (payment dialog only) opens a receipt-only print view via a hidden iframe — not the full browser page.

## Sale creation API

`POST /api/sales`

| Field | Description |
|-------|-------------|
| `customerId` | Optional customer ID |
| `items` | Array of `{ productId, quantity, unitPrice }` |
| `discount` | Discount amount |
| `tax` | Tax amount |
| `paymentMethod` | `CASH`, `CARD`, `MOBILE`, or `CREDIT` |
| `amountPaid` | Amount tendered (defaults to total for non-cash methods) |
| `sendEmail` | Send receipt email if allowed |
| `sendSms` | Send receipt SMS if allowed |

**Permission:** `SALE_CREATE`

The backend validates stock, decrements inventory, assigns a reference (`SL-*`), and records the cashier.

## Constraints

- Insufficient stock blocks checkout.
- Sales cannot be edited or deleted after creation.
- Notifications require a linked customer with contact details.

## Related docs

- [Sales](sales.md)
- [Notifications](notifications.md)
- [Products](products.md)
- [Customers & suppliers](customers-and-suppliers.md)
