# Returns

## Overview

Returns reverse completed sales or purchases by restocking or reducing inventory and recording a return document.

**Page:** `/returns`  
**Access:** `RETURN_VIEW` to view lists; `RETURN_CREATE` to post returns.

## Sales returns

When a customer returns purchased goods:

- Reference a completed sale by ID **or receipt reference** (e.g. `SL-2026-0060`).
- Provide a reason and refund amount.
- Stock is **restored** for all sale line items (full return in current UI).

API: `POST /api/returns/sales`

```json
{
  "saleId": "SL-2026-0060",
  "reason": "Defective item",
  "refundAmount": 50.00,
  "items": []
}
```

`saleId` may be the numeric database id or the sale reference string.

## Purchase returns

When stock is returned to a supplier:

- Reference a received purchase by ID.
- Provide a reason and amount.
- Stock is **reduced** for all purchase line items (full return in current UI).

API: `POST /api/returns/purchase`

## Returns list

`GET /api/returns` returns a combined list of recent sales and purchase returns (sorted by date). Purchase returns also appear on the Purchases page under the **Purchase Returns** tab.

## Role access

| Action | Super Admin | Manager | Cashier | Inventory Officer |
|--------|:-----------:|:-------:|:-------:|:-----------------:|
| View returns page | ✓ | ✓ | ✓ | ✓ |
| Create returns (API) | ✓ | ✓ | — | ✓ |

Cashiers can open the Returns page but **cannot submit** return forms — the API requires `RETURN_CREATE`, which cashiers do not have.

## Limitations

- The UI always sends an empty `items` array (full returns only).
- The backend supports partial line-item returns for future UI support.

## Related docs

- [Sales](sales.md)
- [Purchases](purchases.md)
- [Inventory](inventory.md)
