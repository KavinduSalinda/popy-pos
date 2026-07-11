# User management

## Overview

Super Admins and **Managers** manage staff accounts for a shop: create logins, assign roles, activate or deactivate users, and reset passwords through the user form.

**Page:** `/users`  
**Access:** Super Admin and Manager (`USER_VIEW` to open the page; `USER_MANAGE` to create, edit, or delete)

Managers only see and manage users in **their assigned shop**. They cannot assign the Super Admin role or move users to another shop.

## User fields

| Field | Description |
|-------|-------------|
| Name | Display name |
| Email | Login username (unique) |
| Role | Super Admin, Manager, Cashier, or Inventory Officer |
| Active | Inactive users cannot log in |
| Password | Required on create; optional on edit |

## Capabilities

- Search users by name or email.
- Filter by role and active status.
- Create new staff with role and password.
- Edit name, email, role, active flag, and password.
- Delete user accounts (cannot delete your own account).
- Welcome notification on create (if enabled in settings).

### Manager restrictions

| Action | Manager | Super Admin |
|--------|:-------:|:-----------:|
| View shop users | ✓ | ✓ (per active shop) |
| Create staff | ✓ | ✓ |
| Assign Manager / Cashier / Inventory Officer | ✓ | ✓ |
| Assign Super Admin | — | ✓ |
| Change user shop | — | ✓ |
| Delete own account | — | — |

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/users` | `USER_VIEW` |
| GET | `/api/users/{id}` | `USER_VIEW` |
| POST | `/api/users` | `USER_MANAGE` |
| PUT/PATCH | `/api/users/{id}` | `USER_MANAGE` |
| DELETE | `/api/users/{id}` | `USER_MANAGE` |

All endpoints are shop-scoped via the `X-Shop-Id` header.

## Roles

See the full permission matrix in [Authentication & roles](authentication-and-roles.md).

| Role | Typical assignment |
|------|-------------------|
| Super Admin | Store owner, IT admin |
| Manager | Store manager |
| Cashier | Front-desk staff |
| Inventory Officer | Warehouse / stock staff |

## Development seed

`python manage.py seed_pos` creates:

- `admin@test.com` / `123456` — Super Admin

## Related docs

- [Authentication & roles](authentication-and-roles.md)
- [Multi-shop](multi-shop.md)
- [Notifications](notifications.md)
- [Settings](settings.md)
