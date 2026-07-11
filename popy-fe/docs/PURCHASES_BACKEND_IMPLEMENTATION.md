# Purchases Module — Backend Implementation Guide (Django / DRF / MySQL)

This document describes what **`popy-be`** must implement so the **Popy POS frontend** purchases module works end-to-end.

**Frontend repo:** `popy`  
**Backend repo:** `popy-be`  
**Base URL:** `http://localhost:8000/api`

---

## Status overview

| Feature | Frontend | Backend (`popy-be`) |
|---------|----------|---------------------|
| List purchases | ✅ | ✅ `GET /purchases` |
| Purchase detail | ✅ | ✅ `GET /purchases/{id}` |
| Create purchase | ✅ | ✅ `POST /purchases` |
| Update purchase | ✅ | ❌ **Implement** |
| Delete purchase | ✅ | ❌ **Implement** |
| Receive goods (GRN) | ✅ | ❌ **Implement** |
| Cancel order | ✅ | ❌ **Implement** |
| Purchase returns list | ✅ | ✅ `GET /returns` (array) |
| Create purchase return | ✅ | ✅ `POST /returns/purchase` |

---

## 1. Existing endpoints (keep as-is)

### GET `/api/purchases`

**Query params:** `page`, `pageSize`, `search`, `status`

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "reference": "PO-2026-0001",
      "supplierId": 2,
      "supplierName": "Acme Ltd",
      "status": "ORDERED",
      "items": [],
      "total": 850.0,
      "note": "",
      "createdAt": "2026-06-03T10:00:00Z",
      "updatedAt": "2026-06-03T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

Use camelCase via `CamelCaseModelSerializer` (already in project).

### GET `/api/purchases/{id}`

Return full purchase with nested `items`:

```json
{
  "id": 1,
  "reference": "PO-2026-0001",
  "supplierId": 2,
  "supplierName": "Acme Ltd",
  "status": "ORDERED",
  "total": 850.0,
  "note": "Urgent",
  "items": [
    {
      "id": 10,
      "productId": 5,
      "productName": "Coffee Beans",
      "quantity": 10,
      "costPrice": 8.5,
      "lineTotal": 85.0
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### POST `/api/purchases`

**Request:**

```json
{
  "supplierId": 2,
  "note": "Optional note",
  "status": "ORDERED",
  "items": [
    { "productId": 5, "quantity": 10, "costPrice": 8.5 }
  ]
}
```

**Rules:**

| `status` | Behaviour |
|----------|-----------|
| `ORDERED` | Create PO only — **do not** change stock |
| `RECEIVED` | Create PO **and** increase stock (current behaviour) |
| `DRAFT` | Save without stock movement |

**Important:** Frontend now sends `"status": "ORDERED"` by default. Update `create()` so stock is adjusted **only** when `status == RECEIVED`.

```python
# apps/purchasing/views.py — in create(), wrap adjust_stock block:
if purchase_status == PurchaseStatus.RECEIVED:
    adjust_stock(...)
```

**Permission:** `PURCHASE_MANAGE` or `PURCHASE_CREATE`

---

## 2. New endpoints to implement

### PUT `/api/purchases/{id}`

Update a purchase in `DRAFT` or `ORDERED` status only.

**Request:**

```json
{
  "supplierId": 2,
  "note": "Updated note",
  "items": [
    { "productId": 5, "quantity": 12, "costPrice": 9.0 }
  ]
}
```

**Logic:**

1. Load purchase; reject if `status` not in `DRAFT`, `ORDERED`.
2. Replace line items (delete old `PurchaseItem`, create new).
3. Recalculate `total`.
4. Do **not** touch stock.

**Response:** `200` + full `PurchaseSerializer` data.

**Permission:** `PURCHASE_MANAGE`

**ViewSet mixin:**

```python
class PurchaseViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,   # add
    mixins.DestroyModelMixin,  # add
    viewsets.GenericViewSet,
):
```

Override `update()` with status guard and item replacement inside `@transaction.atomic`.

---

### DELETE `/api/purchases/{id}`

**Allowed when:** `status` in `DRAFT`, `ORDERED`, `CANCELLED`  
**Not allowed when:** `RECEIVED` or `PARTIAL` (stock already affected)

**Response:** `204 No Content`

**Permission:** `PURCHASE_MANAGE`

---

### POST `/api/purchases/{id}/receive`

Goods Received Note (GRN) — mark order as received and update inventory.

**Request:** empty body

**Logic:**

1. Purchase must be `ORDERED` or `PARTIAL`.
2. For each line item, call `adjust_stock(product, quantity, PURCHASE, ...)`.
3. Update product `cost_price` from line item.
4. Set `purchase.status = RECEIVED`.
5. Return updated purchase.

**Response:** `200` + `PurchaseSerializer`

**Implementation:**

```python
from rest_framework.decorators import action

class PurchaseViewSet(...):
    @action(detail=True, methods=["post"], url_path="receive")
    @transaction.atomic
    def receive(self, request, pk=None):
        purchase = self.get_object()
        if purchase.status not in (PurchaseStatus.ORDERED, PurchaseStatus.PARTIAL):
            return Response(
                {"message": "Only ordered purchases can be received", "statusCode": 400},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for item in purchase.items.select_related("product"):
            adjust_stock(
                item.product,
                item.quantity,
                StockTransactionType.PURCHASE,
                note=f"GRN {purchase.reference}",
                reference_type="Purchase",
                reference_id=purchase.id,
            )
            item.product.cost_price = item.cost_price
            item.product.save(update_fields=["cost_price", "updated_at"])
        purchase.status = PurchaseStatus.RECEIVED
        purchase.save(update_fields=["status", "updated_at"])
        return Response(PurchaseSerializer(purchase).data)
```

**Permission map entry:** `"receive": "PURCHASE_MANAGE"`

---

### POST `/api/purchases/{id}/cancel`

Cancel a pending purchase order.

**Logic:**

1. Only if `status == ORDERED`.
2. Set `status = CANCELLED`.

**Response:** `200` + purchase JSON

**Permission:** `PURCHASE_MANAGE`

---

## 3. Purchase returns (already exists — verify shape)

### GET `/api/returns`

Frontend expects a **JSON array** (not paginated):

```json
[
  {
    "id": 1,
    "reference": "PR-2026-0001",
    "type": "PURCHASE",
    "reason": "Damaged goods",
    "amount": 150.0,
    "createdAt": "2026-06-03T11:00:00Z"
  }
]
```

Ensure `PurchaseReturnSerializer` includes `"type": "PURCHASE"` in output.

### POST `/api/returns/purchase`

**Request:**

```json
{
  "purchaseId": 1,
  "reason": "Damaged goods",
  "amount": 150.0,
  "items": []
}
```

**Logic:** Already in `PurchaseReturnCreateView` — verify stock is reduced when return is processed.

---

## 4. Permissions

Add to `apps/core/permissions.py` role map if missing:

| Permission | Roles |
|------------|-------|
| `PURCHASE_VIEW` | Manager, Inventory Officer, Super Admin |
| `PURCHASE_MANAGE` | Manager, Inventory Officer, Super Admin |

Map ViewSet actions:

```python
required_permission_map = {
    "list": "PURCHASE_VIEW",
    "retrieve": "PURCHASE_VIEW",
    "create": "PURCHASE_MANAGE",
    "update": "PURCHASE_MANAGE",
    "partial_update": "PURCHASE_MANAGE",
    "destroy": "PURCHASE_MANAGE",
    "receive": "PURCHASE_MANAGE",
    "cancel": "PURCHASE_MANAGE",
}
```

---

## 5. Serializers

### `PurchaseUpdateSerializer`

Same fields as create (supplier, items, note) — all optional except when replacing items.

```python
class PurchaseUpdateSerializer(CamelCaseSerializer):
    supplier_id = serializers.IntegerField(required=False)
    items = PurchaseItemWriteSerializer(many=True, required=False)
    note = serializers.CharField(required=False, allow_blank=True)
```

### `PurchaseSerializer` — expose `note`

Already has `note` field — ensure it is included in camelCase output as `note`.

### Item total field

Frontend accepts `lineTotal` or `total` on items. Serializer uses `line_total` → camelCase `lineTotal`. ✅

---

## 6. Database (MySQL) — no migration needed

Existing tables:

- `purchasing_purchase`
- `purchasing_purchaseitem`

Statuses enum (`apps/core/choices.py`):

```python
class PurchaseStatus(models.TextChoices):
    DRAFT = "DRAFT"
    ORDERED = "ORDERED"
    RECEIVED = "RECEIVED"
    PARTIAL = "PARTIAL"
    CANCELLED = "CANCELLED"
```

---

## 7. Sample implementation — full `PurchaseViewSet` update

File: `apps/purchasing/views.py`

Add mixins + methods from sections 2–3. Register router unchanged:

```python
router.register(r"purchases", PurchaseViewSet, basename="purchase")
```

DRF automatically exposes:

| Method | URL |
|--------|-----|
| GET | `/api/purchases/` |
| POST | `/api/purchases/` |
| GET | `/api/purchases/{id}/` |
| PUT | `/api/purchases/{id}/` |
| DELETE | `/api/purchases/{id}/` |
| POST | `/api/purchases/{id}/receive/` |
| POST | `/api/purchases/{id}/cancel/` |

---

## 8. Fix create default status

Change `PurchaseCreateSerializer` default:

```python
status = serializers.CharField(required=False, default="ORDERED")
```

And in `create()` view default:

```python
purchase_status = data.get("status", PurchaseStatus.ORDERED)
```

---

## 9. Seed / test data

```bash
python manage.py seed_pos   # if you have seed command
python manage.py runserver 8000
```

Test flow:

1. `POST /api/auth/login` → token  
2. `POST /api/purchases` with `"status": "ORDERED"`  
3. `POST /api/purchases/1/receive/` → stock increases  
4. `GET /api/purchases/1/` → status `RECEIVED`  
5. `POST /api/returns/purchase` with `purchaseId: 1`

---

## 10. Frontend integration checklist

| Frontend route | API |
|----------------|-----|
| `/purchases` | `GET /purchases?status=ORDERED` |
| `/purchases` GRN tab | `GET /purchases?status=RECEIVED` |
| `/purchases` Returns tab | `GET /returns` (filter `type=PURCHASE` client-side) |
| `/purchases/:id` | `GET /purchases/{id}` |
| New purchase | `POST /purchases` |
| Edit (detail page) | `PUT /purchases/{id}` |
| Receive goods button | `POST /purchases/{id}/receive` |
| Cancel button | `POST /purchases/{id}/cancel` |
| Delete button | `DELETE /purchases/{id}` |
| Return button | `POST /returns/purchase` |

**Vite proxy:** `/api` → `http://localhost:8000`

---

## 11. Error responses

Match frontend error handler:

```json
{
  "message": "Only ordered purchases can be received",
  "statusCode": 400,
  "errors": {
    "items": ["At least one item is required."]
  }
}
```

Use existing `custom_exception_handler` in `apps/core/exceptions.py`.

---

*Document version: 1.0 — aligned with Popy POS frontend purchases integration.*
