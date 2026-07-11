# Sales

## Overview

Sales records are created from POS checkout and can be reviewed in the sales history.

**Pages:** `/sales`, `/sales/:id`  
**Access:** `SALE_VIEW` to list and view; `SALE_CREATE` for POS checkout.

## Sale record

| Field | Description |
|-------|-------------|
| Reference | Auto-generated (`SL-*`) |
| Customer | Optional; walk-in if null |
| Items | Product lines with quantity, unit price, line total |
| Subtotal | Sum of line totals |
| Discount | Applied discount |
| Tax | Tax amount |
| Total | Final amount |
| Payment method | Cash, card, mobile, or credit |
| Amount paid | Tendered amount (especially for cash) |
| Cashier | Staff member who completed the sale |
| Created at | Timestamp |

## Capabilities

- Search sales by reference or customer name.
- Paginated sales list.
- View sale detail with line items and receipt preview (no print button on this page — print is available from the POS payment dialog after checkout).

Sales are **immutable** — there is no update or delete API. Corrections use [Returns](returns.md).

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/sales` | `SALE_VIEW` |
| GET | `/api/sales/{id}` | `SALE_VIEW` |
| POST | `/api/sales` | `SALE_CREATE` |

## Related docs

- [Point of Sale](point-of-sale.md)
- [Returns](returns.md)
- [Dashboard](dashboard.md)
- [Reports](reports.md)
