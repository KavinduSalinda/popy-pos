# Settings

## Overview

The settings page (`/settings`) lets Super Admins configure system-wide notification behaviour. It is the only admin settings screen in the application.

**Page:** `/settings`  
**Access:** `SETTINGS_MANAGE` (Super Admin only)

## Notification settings

Settings are stored as a singleton record and apply immediately after save.

### POS checkout

| Toggle | Description |
|--------|-------------|
| Email enabled | Master switch for checkout receipt emails |
| SMS enabled | Master switch for checkout receipt SMS |
| Allow cashiers to send email | Cashiers with permission can opt in per sale |
| Allow cashiers to send SMS | Cashiers with permission can opt in per sale |

### Low inventory

| Toggle / field | Description |
|----------------|-------------|
| Email enabled | Alert managers and super admins by email |
| SMS enabled | Send SMS to the alert phone below |
| SMS alert phone | Phone number for low-stock SMS (e.g. `94771234567`) |

### New customer

| Toggle | Description |
|--------|-------------|
| Email enabled | Welcome email on customer creation |
| SMS enabled | Welcome SMS on customer creation |

### New user

| Toggle | Description |
|--------|-------------|
| Email enabled | Welcome email when a staff account is created |
| SMS enabled | Has no effect today — staff accounts have no phone field |

## API endpoints

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/settings/notifications` | `SETTINGS_MANAGE` |
| PATCH | `/api/settings/notifications` | `SETTINGS_MANAGE` |
| GET | `/api/settings/pos-checkout-notifications` | `POS_ACCESS` |

The POS checkout options endpoint returns only what the current cashier is allowed to offer at checkout (no full settings exposure).

## Defaults

| Setting | Default |
|---------|---------|
| Checkout email | On |
| Checkout SMS | Off |
| Cashier email | On |
| Cashier SMS | Off |
| Low inventory email | On |
| Low inventory SMS | Off |
| New customer email | On |
| New customer SMS | Off |
| New user email | On |
| New user SMS | Off |

## Related docs

- [Notifications](notifications.md)
- [Authentication & roles](authentication-and-roles.md)
- [Point of Sale](point-of-sale.md)
