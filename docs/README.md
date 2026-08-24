# Popy POS — System Documentation

Popy POS is a full-stack point-of-sale and inventory management system for retail operations. It combines a **Django REST** backend with a **React** single-page application for day-to-day sales, stock control, purchasing, and reporting.

> **Note:** Feature docs describe behaviour verified against the `popy-be` and `popy-fe` codebases. The [backend permission matrix](features/authentication-and-roles.md#permission-matrix-backend) is the authority for role access.

cashier@gmail.com   
ca@12345

nadee@gmail.com
Ca!@1234    

sudubole@gmail.com  
User@123    

user@gmail.com      
user12345

kavindu@gmail.com   
12!@qwas

## Architecture

| Layer | Technology |
|-------|------------|
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Frontend | React 19, TypeScript, Vite, MUI, Redux Toolkit |
| Database | SQLite (development) or MySQL (production) |
| Email | [Brevo](https://www.brevo.com) transactional API |
| SMS | [Text.lk](https://text.lk) SMS gateway |

```
popy/
├── popy-be/     # Django API
├── popy-fe/     # React SPA
└── docs/        # This documentation
```

## Core capabilities

- **Point of Sale** — Barcode scanning, cart, multi-payment checkout, receipt print
- **Catalog** — Products, categories, SKU/barcode, pricing, reorder levels
- **Inventory** — Stock levels, transactions, manual adjustments, low-stock alerts
- **Purchasing** — Purchase orders, goods receipt (GRN), supplier management
- **Sales & returns** — Sales history, sales returns, purchase returns
- **Parties** — Customer and supplier directories
- **Dashboard & reports** — KPIs, charts, export-style reports
- **Notifications** — Configurable email/SMS for checkout, inventory, onboarding
- **Multi-shop** — Isolated data per shop/branch with shop context on every request
- **Offline mode** — POS catalog cache, offline checkout queue, sync on reconnect
- **User management** — Role-based access for staff accounts

## User roles

| Role | Typical use |
|------|-------------|
| Super Admin | Full system access, settings, user management |
| Manager | Operations, reports, POS — no user/settings admin |
| Cashier | POS, customers, sales |
| Inventory Officer | Stock, purchases, product updates, returns — no POS or customer access |

See [Authentication & roles](features/authentication-and-roles.md) for the full permission matrix.

## Feature documentation

| Feature | Description |
|---------|-------------|
| [Authentication & roles](features/authentication-and-roles.md) | Login, JWT, roles, permissions |
| [Dashboard](features/dashboard.md) | KPIs and charts on the home screen |
| [Point of Sale](features/point-of-sale.md) | Checkout flow, barcode, receipts |
| [Products](features/products.md) | Product catalog and barcode labels |
| [Categories](features/categories.md) | Product category management |
| [Inventory](features/inventory.md) | Stock overview, adjustments, alerts |
| [Customers & suppliers](features/customers-and-suppliers.md) | Party management |
| [Purchases](features/purchases.md) | Purchase orders and goods receipt |
| [Sales](features/sales.md) | Sales history and sale details |
| [Returns](features/returns.md) | Sales and purchase returns |
| [Reports](features/reports.md) | Tabular business reports |
| [Notifications](features/notifications.md) | Brevo email and Text.lk SMS |
| [Settings](features/settings.md) | Super-admin notification toggles |
| [Multi-shop](features/multi-shop.md) | Shop isolation, `X-Shop-Id`, shop switcher |
| [Offline mode](features/offline-mode.md) | IndexedDB cache, offline POS, sync APIs |
| [User management](features/user-management.md) | Staff accounts and roles |

## API overview

All REST endpoints are under `/api`. Authentication uses JWT bearer tokens. Business endpoints require the **`X-Shop-Id`** header (see [Multi-shop](features/multi-shop.md)).

```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/shops/accessible
CRUD   /api/shops                    # SHOP_MANAGE (super admin)

CRUD   /api/products, /api/categories, /api/customers, /api/suppliers
CRUD   /api/purchases, /api/users
GET    /api/inventory, /api/inventory/transactions
POST   /api/inventory/adjustments
GET    /api/pos/products, /api/pos/products/lookup
GET/POST /api/sales
GET    /api/returns
POST   /api/returns/sales, /api/returns/purchase

GET    /api/dashboard/summary, /api/dashboard/sales-trend, ...
GET    /api/reports/sales, /api/reports/inventory, ...
GET/PATCH /api/settings/notifications
GET       /api/settings/pos-checkout-notifications

GET    /api/sync/bootstrap, /api/sync/catalog, /api/sync/status
POST   /api/sync/sales
```

Auth routes are under `/api/auth/` (e.g. `/api/auth/login`).

Full endpoint and permission details are documented in each feature page.

## Getting started

### Backend

```bash
cd popy-be
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_pos   # optional dev data (admin@test.com / 123456)
python manage.py runserver
```

### Frontend

```bash
cd popy-fe
npm install
cp .env.example .env
npm run dev
```

Default URLs: API `http://localhost:8000`, app `http://localhost:5173`.

### Deploy (free)

Host the API on PythonAnywhere (MySQL) and the React app on Vercel. Step-by-step: [Deploy](DEPLOY.md).

### Notification providers (optional)

Add to `popy-be/.env`:

```env
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=Popy POS
TEXTLK_API_TOKEN=
TEXTLK_SENDER_ID=
```

## Assets

Screenshots, diagrams, and other media for documentation live in [`docs/assets/`](assets/README.md).

## Known limitations

- **Password reset** — UI exists; backend endpoints are stubs (no email is sent).
- **Loyalty points** — Stored on customers and shown in reports; not applied at POS checkout.
- **Partial returns** — Backend supports line-item returns; the UI currently performs full returns only.
- **Frontend vs backend permissions** — The UI role map in `popy-fe` is not always identical to `popy-be/apps/core/permissions.py`. The API is authoritative. See [Authentication & roles](features/authentication-and-roles.md#frontend-vs-backend).
- **Tax rate** — Calculated on the frontend (`VITE_TAX_RATE`); the backend stores the tax amount sent with each sale.
