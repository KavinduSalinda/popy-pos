# Dashboard

## Overview

The dashboard (`/dashboard`) is the landing page after login. It shows real-time business KPIs and charts for quick operational insight.

**Access:** `DASHBOARD_VIEW` (all four roles)

## KPI cards

| Metric | Description |
|--------|-------------|
| Today's Sales | Total revenue for the current day |
| Monthly Sales | Revenue for the current month |
| Total Revenue | All-time sales total |
| Gross Profit | Revenue minus cost of goods sold |
| Low Stock | Count of products at or below reorder level (excluding out-of-stock) |
| Out of Stock | Products with zero quantity |
| Customers | Count of customer records |
| Suppliers | Count of supplier records |

## Charts

| Widget | Chart type | Data |
|--------|------------|------|
| Daily Sales Trend | Line chart | Daily totals (last 7 days) |
| Monthly Sales Trend | Bar chart | Monthly totals (current year) |
| Top Selling Products | Horizontal bar chart | Top products by quantity sold |
| Sales by Category | Pie chart | Revenue by product category |

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/dashboard/summary` | `DASHBOARD_VIEW` |
| GET | `/api/dashboard/sales-trend` | `DASHBOARD_VIEW` |
| GET | `/api/dashboard/top-products` | `DASHBOARD_VIEW` |
| GET | `/api/dashboard/sales-by-category` | `DASHBOARD_VIEW` |

## Related docs

- [Reports](reports.md)
- [Sales](sales.md)
- [Inventory](inventory.md)
