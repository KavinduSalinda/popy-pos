# User management

## Overview

Super Admins manage staff accounts: create logins, assign roles, activate or deactivate users, and reset passwords through the user form.

**Page:** `/users`  
**Access:** Super Admin only in practice — the page requires `USER_VIEW` and every `/api/users` endpoint requires `USER_MANAGE` (only Super Admin has this on the backend).

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
- Delete user accounts.
- Welcome notification on create (if enabled in settings).

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/users` | `USER_MANAGE` |
| GET | `/api/users/{id}` | `USER_MANAGE` |
| POST | `/api/users` | `USER_MANAGE` |
| PUT/PATCH | `/api/users/{id}` | `USER_MANAGE` |
| DELETE | `/api/users/{id}` | `USER_MANAGE` |

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
- [Notifications](notifications.md)
- [Settings](settings.md)
