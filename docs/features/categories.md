# Categories

## Overview

Categories organize products for browsing, reporting, and dashboard breakdowns.

**Page:** `/categories`  
**Access:** `CATEGORY_VIEW` to view; `CATEGORY_MANAGE` to create, edit, or delete.

## Category fields

| Field | Description |
|-------|-------------|
| Name | Unique category name |
| Description | Optional description |

## Capabilities

- List all categories with search.
- Create, edit, and delete categories.
- Product count is available when listing categories.

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/categories` | `CATEGORY_VIEW` |
| GET | `/api/categories/{id}` | `CATEGORY_VIEW` |
| POST | `/api/categories` | `CATEGORY_MANAGE` |
| PUT/PATCH | `/api/categories/{id}` | `CATEGORY_MANAGE` |
| DELETE | `/api/categories/{id}` | `CATEGORY_MANAGE` |

## Related docs

- [Products](products.md)
- [Dashboard](dashboard.md)
