# Purchases

## Overview

Purchase orders track stock ordered from suppliers. Receiving a PO increases inventory and updates product cost prices.

**Pages:** `/purchases`, `/purchases/:id`  
**Access:** `PURCHASE_VIEW` to view; `PURCHASE_MANAGE` to create, receive, cancel, edit, or delete.

## Purchase lifecycle

```
DRAFT → ORDERED → RECEIVED
              ↘ CANCELLED
```

| Status | Meaning |
|--------|---------|
| Draft | Editable, not yet placed |
| Ordered | Sent to supplier; awaiting delivery |
| Received | Goods received; stock updated |
| Partial | Defined in model; limited UI support |
| Cancelled | Order cancelled before receipt |

## Capabilities

- Create purchase orders with supplier and line items (product, quantity, cost price).
- Create a PO with status **Received** to immediately update stock (skips the separate receive step).
- Receive goods (GRN) on ordered POs — increments stock and updates cost price per product.
- Cancel ordered POs (not draft or received).
- Edit draft or ordered POs only.
- Delete draft, ordered, or cancelled POs (received and partial POs cannot be deleted).
- Filter list by status tabs: All, Purchase Orders, Goods Received, Purchase Returns.

## Receive (GRN)

`POST /api/purchases/{id}/receive`

- Only **ordered** (or partial) POs can be received.
- Increases `stock_quantity` for each line item.
- Updates product `cost_price` from the PO line.
- Sets purchase status to **RECEIVED**.

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/purchases` | `PURCHASE_VIEW` |
| GET | `/api/purchases/{id}` | `PURCHASE_VIEW` |
| POST | `/api/purchases` | `PURCHASE_MANAGE` |
| PUT/PATCH | `/api/purchases/{id}` | `PURCHASE_MANAGE` |
| DELETE | `/api/purchases/{id}` | `PURCHASE_MANAGE` |
| POST | `/api/purchases/{id}/receive` | `PURCHASE_MANAGE` |
| POST | `/api/purchases/{id}/cancel` | `PURCHASE_MANAGE` |

## Related docs

- [Suppliers](customers-and-suppliers.md)
- [Inventory](inventory.md)
- [Returns](returns.md)
- [Reports](reports.md)
