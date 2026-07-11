# Inventory

## Overview

Inventory management covers stock visibility, transaction history, manual adjustments, and automatic low-stock alerts.

**Page:** `/inventory`  
**Access:** `INVENTORY_VIEW` to view; `INVENTORY_ADJUST` to post adjustments.

## Stock status

Product stock is classified automatically:

| Status | Condition |
|--------|-----------|
| In stock | Quantity above reorder level, or quantity is zero with reorder level zero |
| Low | Quantity greater than zero and at or below reorder level |
| Out of stock | Quantity is zero |

## Page tabs

| Tab | Content |
|-----|---------|
| Overview | All products with stock status badges |
| Transactions | Full audit log of stock movements |
| Low stock | Products at or below reorder level |
| Out of stock | Products with zero quantity |

## Stock transactions

Every stock change writes a `StockTransaction` record with:

- Product
- Type (sale, purchase, adjustment, return, etc.)
- Quantity change (+ or −)
- Balance after change
- Note and reference to source document

List endpoint: `GET /api/inventory/transactions`

## Manual adjustments

Staff with `INVENTORY_ADJUST` can post adjustments via a dialog:

| Field | Description |
|-------|-------------|
| Product | Product to adjust |
| Type | Damage, Loss, Correction, or Found |
| Quantity | Positive or negative change |
| Note | Reason for adjustment |

API: `POST /api/inventory/adjustments`

## Low-stock alerts

When stock crosses from **above** the reorder level to **at or below** it (and `reorder_level` is greater than zero), the system can send notifications to managers (email) and an optional alert phone (SMS). See [Notifications](notifications.md) and [Settings](settings.md).

Alerts are not sent for products with `reorder_level` set to zero.

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/inventory` | `INVENTORY_VIEW` |
| GET | `/api/inventory/{id}` | `INVENTORY_VIEW` |
| GET | `/api/inventory/transactions` | `INVENTORY_VIEW` |
| POST | `/api/inventory/adjustments` | `INVENTORY_ADJUST` |

Query `?status=low|out|in` to filter the inventory list.

## Related docs

- [Products](products.md)
- [Purchases](purchases.md)
- [Returns](returns.md)
- [Notifications](notifications.md)
