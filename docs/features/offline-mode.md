# Offline Mode

Popy POS supports **offline-first POS checkout** so cashiers can keep selling when the network drops. Catalog data is cached locally in the browser; sales are queued and replayed to the server when connectivity returns.

## Scope

| Area | Offline support |
|------|-----------------|
| POS product search & barcode lookup | Yes — IndexedDB catalog cache |
| POS checkout | Yes — local sale queue with `client_id` idempotency |
| Customer selection at POS | Yes — cached customer list (bootstrap) |
| Receipt print (offline sale) | Yes — local receipt with `OFF-` reference prefix |
| Inventory adjustments | Planned — `pendingJobs` queue scaffold only |
| Purchase orders / GRN | Planned — `pendingJobs` queue scaffold only |
| Dashboard, reports, settings | Online only |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React POS (popy-fe)                                        │
│  ┌──────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │ useOnline    │   │ IndexedDB   │   │ OfflineSync      │  │
│  │ Status       │──▶│ (Dexie)     │◀──│ Provider         │  │
│  └──────────────┘   └──────┬──────┘   └────────┬─────────┘  │
│                              │                    │            │
│  ProductGrid / Cart /        │  pendingSales      │ bootstrap  │
│  PaymentDialog               │  pendingJobs       │ + replay   │
└──────────────────────────────┼────────────────────┼────────────┘
                               │                    │
                               ▼                    ▼
                    ┌──────────────────────────────────────┐
                    │  Django sync APIs (popy-be/apps/sync) │
                    │  GET  /api/sync/bootstrap             │
                    │  GET  /api/sync/catalog               │
                    │  POST /api/sync/sales                 │
                    │  GET  /api/sync/status                │
                    └──────────────────────────────────────┘
```

All sync routes require authentication, `POS_ACCESS` (bootstrap/status) or `SALE_CREATE` (sales batch), and the **`X-Shop-Id`** header.

## IndexedDB design

Database name: `PopyOfflineDB` (Dexie v1).

| Store | Key | Purpose |
|-------|-----|---------|
| `products` | `id` | POS products for current shop (indexed: `shopId`, `sku`, `barcode`, `name`) |
| `customers` | `id` | Walk-in customer picker data |
| `checkoutSettings` | `shopId` | Cached email/SMS toggles for POS checkout |
| `pendingSales` | `clientId` | Offline sales awaiting upload |
| `pendingJobs` | `id` | Future inventory/purchase jobs |
| `syncMeta` | `shopId` | Last bootstrap/sync timestamps and queue counts |

Source: `popy-fe/src/offline/db.ts`.

## Bootstrap flow

1. User logs in while online.
2. `OfflineSyncProvider` calls `GET /api/sync/bootstrap` for the active shop.
3. Response is written to IndexedDB: products, customers (up to 200), checkout notification flags.
4. Cashier can go offline and continue using POS with cached data.

Manual **Download catalog** on the POS offline banner repeats the bootstrap.

## Offline sales

When `navigator.onLine` is false:

1. `PaymentDialog` validates that a catalog exists (`canWorkOffline()`).
2. Sale payload is stored in `pendingSales` with a UUID `clientId`.
3. Local stock in IndexedDB is decremented optimistically.
4. A local `Sale` object is shown for receipt preview/print with reference `OFF-{uuid8}`.

When back online:

1. `OfflineSyncProvider` detects the `online` event.
2. `runFullSync()` refreshes the catalog, then `POST /api/sync/sales` uploads pending sales.
3. Each result is marked `synced`, `duplicate`, or `failed` in IndexedDB.

## Synchronization engine

| Function | File | Role |
|----------|------|------|
| `bootstrapOfflineData` | `syncEngine.ts` | Fetch + cache bootstrap bundle |
| `syncPendingSales` | `syncEngine.ts` | Batch upload pending sales |
| `runFullSync` | `syncEngine.ts` | Bootstrap then replay queue |
| `queueOfflineSale` | `queue.ts` | Enqueue sale + decrement local stock |
| `getQueueSummary` | `queue.ts` | Pending/failed counts for UI |

Background sync runs automatically on login (when online), shop switch, and when the browser fires `online`.

## Conflict resolution

Server-side stock is authoritative.

| Server response | Client action |
|-----------------|---------------|
| `synced` | Mark sale synced; keep server sale in record |
| `duplicate` | Same `client_id` already exists — treat as success |
| `rejected` (409 insufficient stock) | Mark sale `failed`; cashier must review manually |

Conflict messages are surfaced in the POS **Offline banner** via `formatConflictMessage()`.

## Offline authentication

Offline POS does **not** re-authenticate against the API. Requirements:

- Valid JWT still stored in `localStorage` (from last online login).
- Active `currentShopId` in storage.
- Catalog downloaded for that shop.

If any requirement is missing, checkout shows: *"Download the catalog while online before checkout."*

Token expiry while offline is a known limitation — the user must reconnect and log in again.

## Django sync APIs

### `GET /api/sync/bootstrap`

Returns:

- `serverTime`
- `products` — active POS products (`PosProductSerializer`)
- `customers` — up to 200 customers
- `checkoutSettings` — email/SMS flags for cashier checkout

### `GET /api/sync/catalog?since=<iso>`

Delta catalog sync (products + categories updated after `since`). Used for future incremental updates.

### `POST /api/sync/sales`

Body:

```json
{
  "sales": [
    {
      "clientId": "uuid",
      "payload": { "clientId": "uuid", "items": [...], "paymentMethod": "CASH", ... }
    }
  ]
}
```

Response:

```json
{
  "results": [
    { "clientId": "uuid", "status": "synced", "sale": { ... } }
  ],
  "syncedAt": "2026-07-11T12:00:00+00:00"
}
```

Idempotency is enforced by `Sale.client_id` with unique constraint per shop (`apps/sales/models.py`).

### `GET /api/sync/status`

Returns product/customer counts and recent synced offline sales for diagnostics.

## React hooks & components

| Export | Purpose |
|--------|---------|
| `useOnlineStatus` | `navigator.onLine` + event listeners |
| `useOfflineSync` | Sync state + manual sync/download (via context) |
| `useOfflineCatalog` | Search cached products when offline |
| `useOfflineAuth` | Whether offline checkout is ready |
| `OfflineBanner` | POS status bar with sync actions |
| `OfflineSyncProvider` | Bootstrap + auto-sync on reconnect |

POS integration:

- `ProductGrid` — online API vs cached search
- `usePosBarcodeScan` — online lookup vs `lookupCachedProduct`
- `CartPanel` — cached customers when offline
- `PaymentDialog` — queue sale when offline

## Error recovery

- Failed sync sales remain in IndexedDB with `status: failed` and `errorMessage`.
- Cashier can fix stock issues on the server, then use **Sync now** to retry (re-submits pending + failed queue entries via `getPendingSales`).
- Catalog re-bootstrap on sync refreshes stock levels from the server.

## Testing

Backend tests: `tests/backend/test_11_offline_sync.py`

- Bootstrap bundle shape
- Sync status
- Idempotent batch sale upload
- Stock conflict rejection
- Catalog delta filter

Run the full suite:

```bash
python tests/run_all.py
```

## Cursor implementation prompt

Use this prompt to extend or debug offline mode:

```
Implement or fix Popy POS offline mode following docs/features/offline-mode.md.

Backend: apps/sync (bootstrap, catalog, sales batch, status), Sale.client_id idempotency.
Frontend: popy-fe/src/offline (Dexie IndexedDB, syncEngine, queue, hooks, OfflineSyncProvider).
POS must work offline for product search, barcode scan, customer pick, and checkout queue.
On reconnect, auto-sync pending sales via POST /api/sync/sales; mark conflicts as failed.
All APIs need JWT + X-Shop-Id. Add tests in tests/backend/test_11_offline_sync.py.
```

## Related docs

- [Point of Sale](point-of-sale.md)
- [Multi-shop](multi-shop.md)
- [Sales](sales.md)
