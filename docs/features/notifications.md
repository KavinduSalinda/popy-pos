# Notifications

## Overview

Popy POS sends transactional email and SMS through external providers. Notifications are optional, configurable per scenario, and never block core business operations if delivery fails.

## Providers

| Channel | Provider | Environment variables |
|---------|----------|----------------------|
| Email | [Brevo](https://www.brevo.com) | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` |
| SMS | [Text.lk](https://text.lk) | `TEXTLK_API_TOKEN`, `TEXTLK_SENDER_ID` |

If credentials are missing, sends are skipped and logged on the server.

## Notification scenarios

| Scenario | Trigger | Recipients |
|----------|---------|------------|
| POS checkout receipt | Sale created with `sendEmail` / `sendSms` | Customer email / phone |
| Low inventory | Stock drops to reorder level | Manager + Super Admin emails; optional SMS alert phone |
| New customer | Customer record created | Customer email / phone |
| New user | Staff account created | User email only (staff accounts have no phone field; SMS is skipped) |

## POS checkout notifications

Sending a receipt at checkout requires **all** of the following:

1. Shop-level email or SMS enabled in [Settings](settings.md)
2. “Allow cashiers to send” toggle enabled for that channel
3. Cashier role has `POS_CHECKOUT_SEND_EMAIL` or `POS_CHECKOUT_SEND_SMS`
4. Customer selected with email (email) or phone (SMS)
5. Cashier opts in via toggle in the payment dialog

Checkout options for the current user: `GET /api/settings/pos-checkout-notifications`

## Low inventory alerts

Triggered inside `adjust_stock()` when quantity crosses from above the reorder level to at or below it, **and** the product's `reorder_level` is greater than zero.

- **Email:** sent to active Super Admins and Managers assigned to that shop.
- **SMS:** sent to the phone number configured in that shop's settings (`lowInventoryAlertPhone`).

## Message content

Receipt emails/SMS include sale reference, total, and item summary. Welcome messages are sent on customer and user creation. Low-stock messages include product name, SKU, current quantity, and reorder level.

## Backend modules

| Path | Purpose |
|------|---------|
| `apps/core/notifications/email.py` | Brevo send utility |
| `apps/core/notifications/sms.py` | Text.lk send utility |
| `apps/core/notifications/service.py` | Scenario dispatch logic |
| `apps/settings/models.py` | Per-shop, per-scenario toggles |

## Related docs

- [Settings](settings.md)
- [Point of Sale](point-of-sale.md)
- [Inventory](inventory.md)
- [User management](user-management.md)
