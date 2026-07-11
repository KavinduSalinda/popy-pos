# Authentication & roles

## Overview

Staff sign in with email and password. The API issues JWT access and refresh tokens. Every protected route checks the user's role against granular permissions.

## Authentication flow

1. User submits email and password on `/login`.
2. Backend validates credentials and returns:
   - `accessToken` (30-minute lifetime)
   - `refreshToken` (7-day lifetime, rotated on refresh)
   - User object with `role` and `permissions`
3. The frontend stores tokens in localStorage and attaches the access token to API requests.
4. On 401 responses, the client attempts token refresh via `POST /api/auth/refresh`.
5. Logout blacklists the refresh token via `POST /api/auth/logout`.

## API endpoints

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| POST | `/api/auth/logout` | Authenticated |
| POST | `/api/auth/forgot-password` | Public (stub) |
| POST | `/api/auth/reset-password` | Public (stub) |

Password reset endpoints return success messages but do not send emails or change passwords yet.

## Roles

| Role | Code | Description |
|------|------|-------------|
| Super Admin | `SUPER_ADMIN` | Full access including users and settings |
| Manager | `MANAGER` | Day-to-day operations and reports |
| Cashier | `CASHIER` | POS, sales, and customers |
| Inventory Officer | `INVENTORY_OFFICER` | Stock, purchases, product updates, returns |

## Permission model

Permissions are string constants (e.g. `POS_ACCESS`, `SALE_CREATE`). The backend maps each role to a set of permissions in `popy-be/apps/core/permissions.py`. Super Admin has wildcard `*` (all permissions).

**The matrix below reflects the backend** — it is what the API enforces. The frontend uses a similar map for UI gating, but there are a few naming and coverage differences (see [Frontend vs backend](#frontend-vs-backend)).

### Permission matrix (backend)

| Permission | Super Admin | Manager | Cashier | Inventory Officer |
|------------|:-----------:|:-------:|:-------:|:-----------------:|
| `DASHBOARD_VIEW` | ✓ | ✓ | ✓ | ✓ |
| `PRODUCT_VIEW` | ✓ | ✓ | ✓ | ✓ |
| `PRODUCT_CREATE` | ✓ | ✓ | — | — |
| `PRODUCT_UPDATE` | ✓ | ✓ | — | ✓ |
| `PRODUCT_DELETE` | ✓ | ✓ | — | — |
| `CATEGORY_VIEW` | ✓ | ✓ | ✓ | ✓ |
| `CATEGORY_MANAGE` | ✓ | ✓ | — | — |
| `INVENTORY_VIEW` | ✓ | ✓ | — | ✓ |
| `INVENTORY_ADJUST` | ✓ | ✓ | — | ✓ |
| `SUPPLIER_VIEW` | ✓ | ✓ | — | ✓ |
| `SUPPLIER_MANAGE` | ✓ | ✓ | — | — |
| `CUSTOMER_VIEW` | ✓ | ✓ | ✓ | — |
| `CUSTOMER_MANAGE` | ✓ | ✓ | ✓ | — |
| `PURCHASE_VIEW` | ✓ | ✓ | — | ✓ |
| `PURCHASE_MANAGE` | ✓ | ✓ | — | ✓ |
| `POS_ACCESS` | ✓ | ✓ | ✓ | — |
| `POS_CHECKOUT_SEND_EMAIL` | ✓ | ✓ | ✓ | — |
| `POS_CHECKOUT_SEND_SMS` | ✓ | ✓ | ✓ | — |
| `SALE_VIEW` | ✓ | ✓ | ✓ | — |
| `SALE_CREATE` | ✓ | ✓ | ✓ | — |
| `RETURN_VIEW` | ✓ | ✓ | ✓ | ✓ |
| `RETURN_CREATE` | ✓ | ✓ | — | ✓ |
| `REPORT_VIEW` | ✓ | ✓ | — | — |
| `USER_VIEW` | ✓ | ✓ | — | — |
| `USER_MANAGE` | ✓ | ✓ | — | — |
| `SETTINGS_MANAGE` | ✓ | ✓ | — | — |

### Sidebar visibility (by nav permission)

| Sidebar item | Permission required | Typical roles |
|--------------|---------------------|---------------|
| Dashboard | `DASHBOARD_VIEW` | All |
| Point of Sale | `POS_ACCESS` | Super Admin, Manager, Cashier |
| Products | `PRODUCT_VIEW` | All |
| Categories | `CATEGORY_VIEW` | Super Admin, Manager, Cashier, Inventory Officer |
| Inventory | `INVENTORY_VIEW` | Super Admin, Manager, Inventory Officer |
| Suppliers | `SUPPLIER_VIEW` | Super Admin, Manager, Inventory Officer |
| Customers | `CUSTOMER_VIEW` | Super Admin, Manager, Cashier |
| Purchases | `PURCHASE_VIEW` | Super Admin, Manager, Inventory Officer |
| Sales | `SALE_VIEW` | Super Admin, Manager, Cashier |
| Returns | `RETURN_VIEW` | Super Admin, Manager, Cashier, Inventory Officer |
| Reports | `REPORT_VIEW` | Super Admin, Manager |
| Users | `USER_VIEW` | Super Admin, Manager |
| Settings | `SETTINGS_MANAGE` | Super Admin, Manager |

Cashiers receive `CATEGORY_VIEW` from the backend on login, so they may see **Categories** in the sidebar even though they cannot manage categories.

### Frontend vs backend

| Topic | Backend | Frontend |
|-------|---------|----------|
| Users page | `GET /api/users` requires `USER_VIEW`; writes require `USER_MANAGE` | Nav/route uses `USER_VIEW` |
| Return writes | `RETURN_CREATE` | Some UI references `RETURN_MANAGE` (not used by API) |
| Inventory Officer | `PRODUCT_UPDATE` only; no `PRODUCT_CREATE`, `CATEGORY_MANAGE`, or `SUPPLIER_MANAGE` | Client role map may show extra permissions — **API will reject** unauthorized writes |
| Effective permissions | Returned on login per backend role map | Merged with frontend role map in `usePermissions()` |

When in doubt, trust the **backend permission matrix** above for what each role can actually do.

## Frontend route protection

Pages use `ProtectedRoute` with a required permission. The sidebar hides nav items the user cannot access. `PermissionGuard` wraps action buttons (edit, delete, create) inside pages.

## Development seed user

After running `python manage.py seed_pos`:

- Email: `admin@test.com`
- Password: `123456`
- Role: Super Admin

## Related docs

- [User management](user-management.md)
- [Settings](settings.md)
