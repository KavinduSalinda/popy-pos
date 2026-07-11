# Popy POS — Point of Sale Frontend

Enterprise-grade POS system frontend built with **React 19**, **TypeScript**, **Vite**, **Redux Toolkit**, **RTK Query**, **Material UI**, and **React Router**.

## Features

- JWT authentication with refresh-token flow
- Role-based permission system (`PermissionGuard`, `usePermissions`)
- Dashboard with KPIs and Recharts visualizations
- Product & category management
- Inventory (overview, transactions, low/out of stock, adjustments)
- Suppliers, customers, purchases, returns
- Full POS screen (barcode search, cart, checkout, receipt)
- Sales history & user management
- Reports with date filters
- Responsive layout (collapsible sidebar, mobile drawer)
- Unit tests (Vitest + React Testing Library)

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`.

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `/api` |
| `VITE_CURRENCY` | ISO currency code | `USD` |
| `VITE_LOCALE` | BCP-47 locale | `en-US` |
| `VITE_TAX_RATE` | Checkout tax rate (e.g. `0.1` = 10%) | `0.1` |

Configure a dev proxy in `vite.config.ts` if your API runs on another origin.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Architecture

Feature-based structure under `src/features/*`, shared UI in `src/components`, API layer via RTK Query (`src/api/baseApi.ts` + per-feature `injectEndpoints`).

## Backend contract

All endpoints follow the specification under `/api/*` (auth, dashboard, products, categories, inventory, suppliers, customers, purchases, sales, returns, users, reports).
