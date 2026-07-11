# POS System Backend Specification

**Stack:** Django 5.x · Django REST Framework 3.x · MySQL 8.x · SimpleJWT (or djangorestframework-simplejwt)

This document defines the backend to pair with the **Popy POS** React frontend. All paths below are relative to the API base URL (e.g. `http://localhost:8000/api` — match `VITE_API_BASE_URL=/api` and proxy accordingly).

---

## Table of contents

1. [Project setup](#1-project-setup)
2. [Database design](#2-database-design)
3. [Authentication & authorization](#3-authentication--authorization)
4. [API conventions](#4-api-conventions)
5. [Endpoint reference](#5-endpoint-reference)
6. [ViewSets & URL routing](#6-viewsets--url-routing)
7. [Serializers (shapes)](#7-serializers-shapes)
8. [Business rules](#8-business-rules)
9. [Seed data & dev login](#9-seed-data--dev-login)
10. [Frontend integration checklist](#10-frontend-integration-checklist)

---

## 1. Project setup

### 1.1 Recommended project layout

```text
pos_backend/
|---venv/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── accounts/          # User, roles, JWT
│   ├── catalog/           # Product, Category
│   ├── inventory/         # Stock, transactions, adjustments
│   ├── parties/           # Customer, Supplier
│   ├── purchasing/        # Purchase orders
│   ├── sales/             # Sales, POS
│   ├── returns/           # Sales & purchase returns
│   ├── dashboard/         # Aggregations
│   └── reports/           # Report endpoints
├── manage.py
└── requirements.txt
```

### 1.2 Core dependencies

```text
Django>=5.0,<6
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
mysqlclient>=2.2          # or PyMySQL
django-filter>=24.0
drf-spectacular>=0.27     # optional: OpenAPI docs
python-decouple>=3.8
```

### 1.3 MySQL settings (example)

```python
# config/settings/base.py
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": env("DB_NAME", default="pos_db"),
        "USER": env("DB_USER", default="pos_user"),
        "PASSWORD": env("DB_PASSWORD", default=""),
        "HOST": env("DB_HOST", default="127.0.0.1"),
        "PORT": env("DB_PORT", default="3306"),
        "OPTIONS": {
            "charset": "utf8mb4",
            "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

### 1.4 DRF & JWT (example)

```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "apps.core.exceptions.custom_exception_handler",
}

from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```

### 1.5 CORS (frontend dev)

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### 1.6 Root URL map

```python
# config/urls.py
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.api_urls")),  # router for all resources
]
```

---

## 2. Database design

### 2.1 Entity relationship overview

```text
User (custom) ── role ── permissions (optional M2M or role enum)

Category ──< Product ──< InventoryItem (or stock on Product)
Supplier ──< Purchase ──< PurchaseItem >── Product
Customer ──< Sale ──< SaleItem >── Product
StockTransaction (audit log for all stock movements)
StockAdjustment
SalesReturn / PurchaseReturn
```

### 2.2 Core models (MySQL-friendly)

#### `accounts.User` (extends `AbstractUser` or custom)

| Column | Type | Notes |
|--------|------|--------|
| id | BIGINT PK | |
| email | VARCHAR(255) UNIQUE | login field |
| password | VARCHAR(128) | hashed |
| name | VARCHAR(120) | display name |
| role | ENUM / VARCHAR | `SUPER_ADMIN`, `MANAGER`, `CASHIER`, `INVENTORY_OFFICER` |
| is_active | BOOLEAN | default true |
| avatar_url | VARCHAR(500) NULL | optional |
| created_at, updated_at | DATETIME | |

#### `catalog.Category`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| name | VARCHAR(80) UNIQUE |
| description | TEXT NULL |
| created_at, updated_at | DATETIME |

#### `catalog.Product`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| name | VARCHAR(120) |
| sku | VARCHAR(60) UNIQUE |
| barcode | VARCHAR(60) NULL UNIQUE |
| category_id | FK → Category |
| brand | VARCHAR(80) NULL |
| unit | VARCHAR(20) |
| cost_price | DECIMAL(12,2) |
| selling_price | DECIMAL(12,2) |
| reorder_level | INT default 0 |
| stock_quantity | INT default 0 |
| status | BOOLEAN default true |
| created_at, updated_at | DATETIME |

Indexes: `(sku)`, `(barcode)`, `(category_id)`, `(name)` for search.

#### `parties.Customer`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| name | VARCHAR(120) |
| phone | VARCHAR(20) |
| email | VARCHAR(255) NULL |
| address | TEXT NULL |
| loyalty_points | INT default 0 |
| created_at, updated_at | DATETIME |

#### `parties.Supplier`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| name | VARCHAR(120) |
| company_name | VARCHAR(120) NULL |
| phone | VARCHAR(20) |
| email | VARCHAR(255) NULL |
| address | TEXT NULL |
| created_at, updated_at | DATETIME |

#### `purchasing.Purchase`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| reference | VARCHAR(32) UNIQUE |
| supplier_id | FK |
| status | ENUM: DRAFT, ORDERED, RECEIVED, PARTIAL, CANCELLED |
| total | DECIMAL(14,2) |
| note | TEXT NULL |
| created_at, updated_at | DATETIME |

#### `purchasing.PurchaseItem`

| purchase_id, product_id, quantity, cost_price, line_total |

#### `sales.Sale`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| reference | VARCHAR(32) UNIQUE |
| customer_id | FK NULL |
| subtotal, discount, tax, total | DECIMAL |
| payment_method | ENUM: CASH, CARD, MOBILE, CREDIT |
| amount_paid | DECIMAL NULL |
| cashier_id | FK → User |
| created_at | DATETIME |

#### `sales.SaleItem`

| sale_id, product_id, quantity, unit_price, total |

#### `inventory.StockTransaction`

| Column | Type |
|--------|------|
| id | BIGINT PK |
| product_id | FK |
| type | PURCHASE, SALE, ADJUSTMENT, RETURN, TRANSFER |
| quantity | INT (+ in, − out) |
| balance | INT (after transaction) |
| note | VARCHAR(255) NULL |
| reference_type, reference_id | optional polymorphic link |
| created_at | DATETIME |

#### `inventory.StockAdjustment`

| product_id, adjustment_type (DAMAGE, LOSS, CORRECTION, FOUND), quantity, note, user_id, created_at |

#### `returns.SalesReturn` / `returns.PurchaseReturn`

| reference, sale_id or purchase_id, reason, amount/refund_amount, items JSON or line table, created_at |

---

## 3. Authentication & authorization

### 3.1 Roles (match frontend)

| Role | Code |
|------|------|
| Super Admin | `SUPER_ADMIN` |
| Manager | `MANAGER` |
| Cashier | `CASHIER` |
| Inventory Officer | `INVENTORY_OFFICER` |

### 3.2 Permission codes (match frontend `PERMISSIONS`)

Implement DRF permission classes or a custom `HasPOSPermission` that checks role → permission map (same as frontend `ROLE_PERMISSIONS` in `src/constants/permissions.ts`).

Examples:

- `PRODUCT_CREATE`, `PRODUCT_VIEW`, `PRODUCT_UPDATE`, `PRODUCT_DELETE`
- `POS_ACCESS`, `SALE_CREATE`, `INVENTORY_ADJUST`, `USER_MANAGE`, `REPORT_VIEW`, etc.

Super Admin: allow all.

### 3.3 Auth endpoints (not ViewSets — APIView)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Public | Refresh token |
| POST | `/api/auth/logout` | Bearer | Blacklist refresh (optional) |
| POST | `/api/auth/forgot-password` | Public | Send reset email |
| POST | `/api/auth/reset-password` | Public | Reset with token |

---

## 4. API conventions

### 4.1 Request / response format

- **Content-Type:** `application/json`
- **Auth header:** `Authorization: Bearer <accessToken>`
- **Dates:** ISO 8601 strings (`2026-06-03T10:30:00Z`)
- **Decimals:** JSON numbers (serialize `Decimal` as float/string consistently)
- **IDs:** integer (frontend accepts `number | string`)

### 4.2 Pagination (list endpoints)

Query params: `page`, `pageSize` (frontend sends both; DRF default is `page` + `page_size` — **map in a custom pagination class** or accept `pageSize` alias).

**Response shape (required by frontend):**

```json
{
  "data": [],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

Example custom pagination:

```python
class POSPagination(PageNumberPagination):
    page_size_query_param = "pageSize"
    page_query_param = "page"

    def get_paginated_response(self, data):
        return Response({
            "data": data,
            "total": self.page.paginator.count,
            "page": self.page.number,
            "pageSize": self.get_page_size(self.request),
        })
```

### 4.3 Errors

```json
{
  "message": "Human-readable error",
  "statusCode": 400,
  "errors": {
    "email": ["This field is required."]
  }
}
```

Map DRF validation errors to this structure in `custom_exception_handler`.

### 4.4 Search & filters

| Param | Usage |
|-------|--------|
| `search` | `SearchFilter` on name, sku, barcode, reference, etc. |
| `category` | filter products by `category_id` |
| `status` | `true` / `false` for product active |
| `fromDate`, `toDate` | reports & sales history |
| `branchId` | optional multi-branch (future) |

---

## 5. Endpoint reference

Base path: **`/api`**

### 5.1 Authentication

#### POST `/auth/login`

**Request:**

```json
{
  "email": "admin@test.com",
  "password": "123456"
}
```

**Response `200`:**

```json
{
  "accessToken": "<jwt-access>",
  "refreshToken": "<jwt-refresh>",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@test.com",
    "role": "SUPER_ADMIN",
    "permissions": [],
    "avatarUrl": null,
    "isActive": true
  }
}
```

Use **camelCase** in JSON (serializer `to_representation` or `djangorestframework-camel-case` optional; frontend expects camelCase keys).

#### POST `/auth/refresh`

**Request:**

```json
{
  "refreshToken": "<jwt-refresh>"
}
```

**Response `200`:**

```json
{
  "accessToken": "<new-access>",
  "refreshToken": "<new-refresh>",
  "user": { }
}
```

#### POST `/auth/logout`

**Request:** empty or `{ "refreshToken": "..." }`  
**Response `204`**

#### POST `/auth/forgot-password`

**Request:** `{ "email": "admin@test.com" }`  
**Response `200`:** `{ "message": "If an account exists..." }`

#### POST `/auth/reset-password`

**Request:** `{ "token": "<token>", "password": "newpass" }`  
**Response `200`:** `{ "message": "Password reset successfully" }`

---

### 5.2 Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/summary` | KPI aggregates |
| GET | `/dashboard/sales-trend` | Daily + monthly trends |
| GET | `/dashboard/top-products` | Top sellers |
| GET | `/dashboard/sales-by-category` | Pie chart data |

#### GET `/dashboard/summary`

**Response:**

```json
{
  "todaySales": 25000,
  "monthlySales": 500000,
  "totalRevenue": 1200000,
  "grossProfit": 125000,
  "lowStockCount": 12,
  "outOfStockCount": 3,
  "totalCustomers": 150,
  "totalSuppliers": 20
}
```

#### GET `/dashboard/sales-trend`

**Response:**

```json
{
  "daily": [{ "label": "Mon", "total": 1200 }],
  "monthly": [{ "label": "Jan", "total": 45000 }]
}
```

#### GET `/dashboard/top-products`

**Response:** array

```json
[
  {
    "productId": 1,
    "name": "Product A",
    "quantitySold": 120,
    "revenue": 2400
  }
]
```

#### GET `/dashboard/sales-by-category`

**Response:**

```json
[
  { "category": "Beverages", "total": 15000 }
]
```

---

### 5.3 Products

| Method | Path | Permission |
|--------|------|------------|
| GET | `/products` | PRODUCT_VIEW |
| GET | `/products/{id}` | PRODUCT_VIEW |
| POST | `/products` | PRODUCT_CREATE |
| PUT | `/products/{id}` | PRODUCT_UPDATE |
| DELETE | `/products/{id}` | PRODUCT_DELETE |

**Query:** `?page=1&pageSize=20&search=&category=&status=`

**Product object:**

```json
{
  "id": 1,
  "name": "Coffee Beans",
  "sku": "COF-001",
  "barcode": "8901234567890",
  "categoryId": 2,
  "categoryName": "Beverages",
  "brand": "House",
  "unit": "kg",
  "costPrice": 8.5,
  "sellingPrice": 12.0,
  "reorderLevel": 10,
  "stockQuantity": 45,
  "status": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-15T00:00:00Z"
}
```

**Create/Update body:**

```json
{
  "name": "",
  "sku": "",
  "barcode": "",
  "categoryId": "",
  "brand": "",
  "unit": "",
  "costPrice": 0,
  "sellingPrice": 0,
  "reorderLevel": 0,
  "status": true
}
```

---

### 5.4 Categories

| Method | Path |
|--------|------|
| GET | `/categories` |
| POST | `/categories` |
| PUT | `/categories/{id}` |
| DELETE | `/categories/{id}` |

**Note:** Frontend list expects a **plain array** for categories (not paginated). Return `Category[]` from list action or dedicated endpoint.

**Category:**

```json
{
  "id": 1,
  "name": "Beverages",
  "description": "",
  "productCount": 12,
  "createdAt": "",
  "updatedAt": ""
}
```

---

### 5.5 Inventory

| Method | Path |
|--------|------|
| GET | `/inventory` |
| GET | `/inventory/transactions` |
| POST | `/inventory/adjustments` |

**Query inventory:** `?page=1&pageSize=20&search=&status=low|out|in`

**Inventory row:**

```json
{
  "id": 1,
  "productId": 10,
  "productName": "Coffee",
  "sku": "COF-001",
  "stockQuantity": 5,
  "reorderLevel": 10,
  "status": "low"
}
```

`status` derived: `out` if qty ≤ 0, `low` if qty ≤ reorder_level, else `in`.

**POST `/inventory/adjustments`:**

```json
{
  "productId": 1,
  "adjustmentType": "DAMAGE",
  "quantity": 5,
  "note": ""
}
```

`quantity`: positive adds stock, negative reduces (match frontend note). Update `Product.stock_quantity`, insert `StockTransaction`.

**Transaction row:**

```json
{
  "id": 1,
  "productId": 1,
  "productName": "Coffee",
  "type": "ADJUSTMENT",
  "quantity": -5,
  "balance": 40,
  "note": "Damaged",
  "createdAt": ""
}
```

---

### 5.6 Suppliers

| Method | Path |
|--------|------|
| GET | `/suppliers` |
| GET | `/suppliers/{id}` |
| POST | `/suppliers` |
| PUT | `/suppliers/{id}` |
| DELETE | `/suppliers/{id}` |

**Fields:** `name`, `companyName`, `phone`, `email`, `address`

---

### 5.7 Customers

| Method | Path |
|--------|------|
| GET | `/customers` |
| GET | `/customers/{id}` |
| POST | `/customers` |
| PUT | `/customers/{id}` |
| DELETE | `/customers/{id}` |

**Fields:** `name`, `phone`, `email`, `address`, `loyaltyPoints`

---

### 5.8 Purchases

| Method | Path |
|--------|------|
| GET | `/purchases` |
| GET | `/purchases/{id}` |
| POST | `/purchases` |

**Query:** `?page=1&pageSize=20&search=&status=RECEIVED`

**Create:**

```json
{
  "supplierId": 1,
  "items": [
    { "productId": 1, "quantity": 10, "costPrice": 8.5 }
  ],
  "note": ""
}
```

On create: set status `ORDERED` or `RECEIVED` per workflow; increase stock when `RECEIVED`; log `StockTransaction` type `PURCHASE`.

**Purchase object:**

```json
{
  "id": 1,
  "reference": "PO-2026-0001",
  "supplierId": 1,
  "supplierName": "Acme Supplies",
  "status": "RECEIVED",
  "items": [],
  "total": 850.0,
  "createdAt": "",
  "updatedAt": ""
}
```

---

### 5.9 POS & Sales

| Method | Path |
|--------|------|
| GET | `/pos/products` |
| POST | `/sales` |
| GET | `/sales` |
| GET | `/sales/{id}` |

#### GET `/pos/products`

**Query:** `?search=`

Return array (or paginated — frontend expects list of POS products):

```json
[
  {
    "id": 1,
    "name": "Coffee",
    "sku": "COF-001",
    "barcode": "",
    "sellingPrice": 12.0,
    "stockQuantity": 45,
    "categoryName": "Beverages"
  }
]
```

Only `status=true` and optionally `stockQuantity > 0`.

#### POST `/sales`

```json
{
  "customerId": 1,
  "items": [
    { "productId": 1, "quantity": 2, "unitPrice": 12.0 }
  ],
  "discount": 0,
  "tax": 2.4,
  "paymentMethod": "CASH",
  "amountPaid": 50.0
}
```

**Logic:**

1. Validate stock for each line.
2. Compute subtotal, apply discount, tax (or recalculate server-side).
3. Create `Sale` + `SaleItem` rows.
4. Decrease `Product.stock_quantity`.
5. Log `StockTransaction` type `SALE`.
6. Return full `Sale` with `reference`, `items`, totals.

**Sale response:**

```json
{
  "id": 1,
  "reference": "SL-2026-0001",
  "customerId": 1,
  "customerName": "Walk-in",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Coffee",
      "quantity": 2,
      "unitPrice": 12.0,
      "total": 24.0
    }
  ],
  "subtotal": 24.0,
  "discount": 0,
  "tax": 2.4,
  "total": 26.4,
  "paymentMethod": "CASH",
  "cashierName": "Admin",
  "createdAt": ""
}
```

---

### 5.10 Returns

| Method | Path |
|--------|------|
| GET | `/returns` | optional list |
| POST | `/returns/sales` |
| POST | `/returns/purchase` |

**Sales return:**

```json
{
  "saleId": 1,
  "reason": "Defective",
  "items": [],
  "refundAmount": 26.4
}
```

**Purchase return:**

```json
{
  "purchaseId": 1,
  "reason": "Wrong item",
  "items": [],
  "amount": 100.0
}
```

Restore/adjust stock and log `StockTransaction` type `RETURN`.

---

### 5.11 Users

| Method | Path |
|--------|------|
| GET | `/users` |
| GET | `/users/{id}` |
| POST | `/users` |
| PUT | `/users/{id}` |
| DELETE | `/users/{id}` |

**User object:**

```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@test.com",
  "role": "SUPER_ADMIN",
  "isActive": true,
  "createdAt": "",
  "updatedAt": ""
}
```

**Create:** include `password` (write-only). Hash with `set_password`.

---

### 5.12 Reports

| Method | Path | Query |
|--------|------|-------|
| GET | `/reports/sales` | `fromDate`, `toDate`, `branchId` |
| GET | `/reports/inventory` | same |
| GET | `/reports/purchases` | same |
| GET | `/reports/customers` | same |
| GET | `/reports/profit` | same |

**Response shape (frontend):**

```json
{
  "columns": [
    { "field": "date", "header": "Date", "type": "date" },
    { "field": "total", "header": "Total", "type": "currency" }
  ],
  "rows": [
    { "date": "2026-06-01", "total": 1200 }
  ],
  "summary": {
    "grandTotal": 50000
  }
}
```

`type`: `currency` | `number` | `date` | `text`

---

## 6. ViewSets & URL routing

### 6.1 Router registration (DRF `DefaultRouter`)

```python
# apps/api_urls.py
from rest_framework.routers import DefaultRouter
from apps.catalog.views import ProductViewSet, CategoryViewSet
from apps.parties.views import CustomerViewSet, SupplierViewSet
from apps.purchasing.views import PurchaseViewSet
from apps.sales.views import SaleViewSet, PosProductViewSet
from apps.inventory.views import InventoryViewSet, StockTransactionViewSet
from apps.accounts.views import UserViewSet
from apps.returns.views import ReturnViewSet
from apps.dashboard.views import DashboardViewSet
from apps.reports.views import ReportViewSet

router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="product")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"purchases", PurchaseViewSet, basename="purchase")
router.register(r"sales", SaleViewSet, basename="sale")
router.register(r"users", UserViewSet, basename="user")
router.register(r"inventory", InventoryViewSet, basename="inventory")
router.register(r"returns", ReturnViewSet, basename="return")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")
router.register(r"reports", ReportViewSet, basename="report")

urlpatterns = router.urls
```

### 6.2 Custom actions (examples)

```python
# ProductViewSet — standard CRUD
class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related("category")
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "PRODUCT_VIEW",
        "retrieve": "PRODUCT_VIEW",
        "create": "PRODUCT_CREATE",
        "update": "PRODUCT_UPDATE",
        "partial_update": "PRODUCT_UPDATE",
        "destroy": "PRODUCT_DELETE",
    }
    filterset_fields = ["category", "status"]
    search_fields = ["name", "sku", "barcode"]

# CategoryViewSet — list returns array (override list)
class CategoryViewSet(ModelViewSet):
    pagination_class = None  # frontend expects Category[]

# InventoryViewSet
class InventoryViewSet(ReadOnlyModelViewSet):
  @action(detail=False, methods=["get"], url_path="transactions")
  def transactions(self, request): ...

# InventoryViewSet — adjustments as separate View or @action
# POST /inventory/adjustments/ → InventoryAdjustmentAPIView

# PosProductViewSet or @action on ProductViewSet
# GET /pos/products/ → register separately:
# path("pos/products/", PosProductListAPIView.as_view())

# DashboardViewSet (ReadOnly, no model)
class DashboardViewSet(ViewSet):
    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request): ...

    @action(detail=False, methods=["get"], url_path="sales-trend")
    def sales_trend(self, request): ...

# ReportViewSet
class ReportViewSet(ViewSet):
    @action(detail=False, methods=["get"], url_path="sales")
    def sales(self, request): ...
```

### 6.3 URL paths that are NOT standard router CRUD

Register explicitly in `api_urls.py`:

```python
urlpatterns = [
    path("pos/products/", PosProductListView.as_view()),
    path("inventory/transactions/", StockTransactionListView.as_view()),
    path("inventory/adjustments/", StockAdjustmentCreateView.as_view()),
    path("returns/sales/", SalesReturnCreateView.as_view()),
    path("returns/purchase/", PurchaseReturnCreateView.as_view()),
    path("dashboard/summary/", dashboard_summary),
    path("dashboard/sales-trend/", dashboard_sales_trend),
    path("dashboard/top-products/", dashboard_top_products),
    path("dashboard/sales-by-category/", dashboard_sales_by_category),
] + router.urls
```

**Alternative:** use nested `@action` on ViewSets so everything stays under one router (cleaner for DRF).

---

## 7. Serializers (shapes)

Use consistent **camelCase** output. Example with manual fields or `CamelCaseJSONRenderer`.

```python
class ProductSerializer(serializers.ModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all()
    )
    category_name = serializers.CharField(source="category.name", read_only=True)
    cost_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    selling_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    reorder_level = serializers.IntegerField()
    stock_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "name", "sku", "barcode", "category_id", "category_name",
            "brand", "unit", "cost_price", "selling_price", "reorder_level",
            "stock_quantity", "status", "created_at", "updated_at",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return to_camel_case(data)  # categoryId, categoryName, etc.
```

Apply same pattern for all serializers returned to the frontend.

---

## 8. Business rules

| Area | Rule |
|------|------|
| Stock | Never allow negative stock on sale unless setting enabled |
| Sale | Use DB transaction (`atomic`) for sale + items + stock + ledger |
| Purchase | On RECEIVED, increase stock; reference PO number auto-generated |
| SKU / barcode | Unique constraints; return 400 with field errors |
| Delete product | Soft-delete or block if open stock/sales exist |
| Tax | Server may recalculate tax from settings; frontend sends `tax` for display |
| References | Auto-generate: `SL-YYYY-NNNN`, `PO-YYYY-NNNN` |
| JWT | Return keys `accessToken`, `refreshToken` (not snake_case) for login/refresh |

---

## 9. Seed data & dev login

Management command: `python manage.py seed_pos`

```python
# Create superuser for frontend dev
User.objects.create_user(
    email="admin@test.com",
    password="123456",
    name="Admin User",
    role="SUPER_ADMIN",
)
# Sample categories, products, customers, suppliers
```

After seeding, frontend login with:

- **Email:** `admin@test.com`
- **Password:** `123456`

---

## 10. Frontend integration checklist

| Item | Backend | Frontend |
|------|---------|----------|
| API base | `http://localhost:8000/api` | `VITE_API_BASE_URL=/api` + Vite proxy to `:8000` |
| Pagination | `{ data, total, page, pageSize }` | `useListParams` |
| Auth keys | `accessToken`, `refreshToken`, `user` | `authSlice`, `tokenService` |
| Refresh body | `{ "refreshToken": "..." }` | `axiosBaseQuery.ts` |
| Categories list | JSON array | `useGetCategoriesQuery` expects `Category[]` |
| POS products | JSON array | `useSearchPosProductsQuery` |
| CORS | Allow `http://localhost:5173` | Vite dev server |
| 401 | Return 401 → frontend refreshes token | `axiosBaseQuery` |

### Vite proxy (frontend `vite.config.ts`)

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // Django, not 3000
    changeOrigin: true,
  },
},
```

### Django run

```bash
python manage.py migrate
python manage.py seed_pos
python manage.py runserver 8000
```

---

## Appendix A — Quick `requirements.txt`

```text
Django>=5.0,<6
djangorestframework>=3.15
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.3
mysqlclient>=2.2
django-filter>=24.0
python-decouple>=3.8
Pillow>=10.0
```

## Appendix B — Model `choices` (Python)

```python
class Role(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
    MANAGER = "MANAGER", "Manager"
    CASHIER = "CASHIER", "Cashier"
    INVENTORY_OFFICER = "INVENTORY_OFFICER", "Inventory Officer"

class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Cash"
    CARD = "CARD", "Card"
    MOBILE = "MOBILE", "Mobile"
    CREDIT = "CREDIT", "Credit"

class AdjustmentType(models.TextChoices):
    DAMAGE = "DAMAGE", "Damage"
    LOSS = "LOSS", "Loss"
    CORRECTION = "CORRECTION", "Correction"
    FOUND = "FOUND", "Found"
```

---

*Document version: 1.0 — aligned with Popy POS frontend (`popy` repository).*
