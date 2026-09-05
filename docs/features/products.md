# Products

## Overview

The products page (`/products`) manages the sellable catalog. Each product links to a category and tracks pricing, stock quantity, and reorder thresholds.

**Access:** `PRODUCT_VIEW` (all roles); create/update/delete gated by respective permissions.

## Product fields

| Field | Description |
|-------|-------------|
| Name | Display name |
| SKU | Unique stock-keeping unit |
| Barcode | Optional unique barcode for scanning |
| Category | Required category assignment |
| Brand | Optional brand name |
| Unit | Unit of measure (pcs, kg/g, litre/ml, box, pack, dozen) |
| Cost price | Purchase cost |
| Selling price | POS sale price |
| Reorder level | Threshold for low-stock alerts |
| Stock quantity | Current on-hand quantity |
| Status | Active or inactive (inactive hidden from POS) |

## Capabilities

- Search and paginate the product list.
- Filter by category and active status.
- Create, edit, and delete products (permission-gated).
- Generate or enter barcodes on the product form.
- Print barcode labels from the product list or form (client-side label generation).

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/products` | `PRODUCT_VIEW` |
| GET | `/api/products/{id}` | `PRODUCT_VIEW` |
| POST | `/api/products` | `PRODUCT_CREATE` |
| PUT/PATCH | `/api/products/{id}` | `PRODUCT_UPDATE` |
| DELETE | `/api/products/{id}` | `PRODUCT_DELETE` |

## Stock quantity

Stock is updated automatically through:

- POS sales (decrement)
- Purchase receive (increment)
- Inventory adjustments
- Sales and purchase returns

Manual edits to `stockQuantity` on the product form are possible but **stock changes should use audited flows** — [Inventory](inventory.md) adjustments, [Purchases](purchases.md), POS sales, or [Returns](returns.md).

## Related docs

- [Categories](categories.md)
- [Inventory](inventory.md)
- [Point of Sale](point-of-sale.md)
