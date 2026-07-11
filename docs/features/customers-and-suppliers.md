# Customers & suppliers

## Overview

Parties are external contacts: **customers** who buy from the store and **suppliers** who supply stock.

| Page | Path | Access |
|------|------|--------|
| Customers | `/customers` | `CUSTOMER_VIEW` / `CUSTOMER_MANAGE` |
| Suppliers | `/suppliers` | `SUPPLIER_VIEW` / `SUPPLIER_MANAGE` |

## Customers

### Fields

| Field | Description |
|-------|-------------|
| Name | Customer name |
| Phone | Required contact number |
| Email | Optional; used for receipt emails |
| Address | Optional |
| Loyalty points | Stored on record; shown in reports (not redeemed at POS) |

### Capabilities

- Search and paginate customers.
- Create, edit, and delete customers.
- Select customers on the POS cart for walk-in vs registered sales.
- Welcome email/SMS on new customer creation (if enabled in settings).

### API

CRUD at `/api/customers`

## Suppliers

### Fields

| Field | Description |
|-------|-------------|
| Name | Contact name |
| Company name | Optional business name |
| Phone | Required |
| Email | Optional |
| Address | Optional |

### Capabilities

- Search and paginate suppliers.
- Create, edit, and delete suppliers.
- Link suppliers to purchase orders.

### API

CRUD at `/api/suppliers`

## Role access summary

| Action | Super Admin | Manager | Cashier | Inventory Officer |
|--------|:-----------:|:-------:|:-------:|:-----------------:|
| View customers | ✓ | ✓ | ✓ | — |
| Manage customers | ✓ | ✓ | ✓ | — |
| View suppliers | ✓ | ✓ | — | ✓ |
| Manage suppliers | ✓ | ✓ | — | — |

## Related docs

- [Point of Sale](point-of-sale.md)
- [Purchases](purchases.md)
- [Notifications](notifications.md)
- [Reports](reports.md)
