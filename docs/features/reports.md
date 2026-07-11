# Reports

## Overview

The reports page (`/reports`) provides tabular business reports with optional date-range filters. Data is read-only and suitable for review or export.

**Access:** `REPORT_VIEW` (Super Admin, Manager)

## Report tabs

| Tab | Date filter | Content |
|-----|-------------|---------|
| Sales | Yes (`fromDate`, `toDate`) | Daily sales totals and grand total |
| Inventory | No | All products with stock quantity and inventory value (qty × cost) |
| Purchase | Yes (`fromDate`, `toDate`) | Purchase orders with supplier, total, and date |
| Customers | No | Customer list with loyalty points and lifetime sales |
| Profit | Yes | Daily gross profit and grand total |

## Profit calculation

Gross profit per line: `(unit selling price − cost price) × quantity sold`

Aggregated by day within the selected date range.

## API endpoints

| Method | Path | Query params |
|--------|------|--------------|
| GET | `/api/reports/sales` | `fromDate`, `toDate` |
| GET | `/api/reports/inventory` | — |
| GET | `/api/reports/purchases` | `fromDate`, `toDate` |
| GET | `/api/reports/customers` | — |
| GET | `/api/reports/profit` | `fromDate`, `toDate` |

All require `REPORT_VIEW`.

## Related docs

- [Dashboard](dashboard.md)
- [Sales](sales.md)
- [Inventory](inventory.md)
- [Purchases](purchases.md)
- [Customers & suppliers](customers-and-suppliers.md)
