from django.contrib.auth import get_user_model

from apps.core.notifications.email import send_email
from apps.core.notifications.sms import send_sms
from apps.core.permissions import role_has_permission
from apps.settings.models import NotificationSettings

User = get_user_model()


def _get_settings(shop) -> NotificationSettings:
    return NotificationSettings.load(shop)


def _dispatch(*, email_enabled: bool, sms_enabled: bool, email: str | None, phone: str | None, subject: str, html: str, text: str, sms_text: str):
    if email_enabled and email:
        send_email(to_email=email, subject=subject, html_content=html, text_content=text)

    if sms_enabled and phone:
        send_sms(to_phone=phone, message=sms_text)


def notify_pos_checkout(sale, *, send_email: bool = False, send_sms: bool = False, user=None) -> None:
    settings = _get_settings(sale.shop)
    customer = sale.customer
    if not customer:
        return

    email_allowed = (
        send_email
        and settings.pos_checkout_email_enabled
        and settings.pos_checkout_cashier_email_enabled
        and user is not None
        and role_has_permission(user.role, "POS_CHECKOUT_SEND_EMAIL")
    )
    sms_allowed = (
        send_sms
        and settings.pos_checkout_sms_enabled
        and settings.pos_checkout_cashier_sms_enabled
        and user is not None
        and role_has_permission(user.role, "POS_CHECKOUT_SEND_SMS")
    )

    if not email_allowed and not sms_allowed:
        return

    items_summary = ", ".join(
        f"{item.product.name} x{item.quantity}" for item in sale.items.select_related("product").all()
    )
    subject = f"Receipt {sale.reference}"
    html = (
        f"<p>Hi {customer.name},</p>"
        f"<p>Thank you for your purchase at Popy POS.</p>"
        f"<p><strong>Reference:</strong> {sale.reference}<br>"
        f"<strong>Total:</strong> {sale.total}<br>"
        f"<strong>Items:</strong> {items_summary}</p>"
    )
    text = (
        f"Hi {customer.name},\n\n"
        f"Thank you for your purchase.\n"
        f"Reference: {sale.reference}\n"
        f"Total: {sale.total}\n"
        f"Items: {items_summary}"
    )
    sms = f"Thanks for shopping! Ref {sale.reference}, total {sale.total}."

    _dispatch(
        email_enabled=email_allowed,
        sms_enabled=sms_allowed,
        email=customer.email,
        phone=customer.phone,
        subject=subject,
        html=html,
        text=text,
        sms_text=sms,
    )


def notify_low_inventory(product) -> None:
    settings = _get_settings(product.shop)
    subject = f"Low stock: {product.name}"
    html = (
        f"<p>Product <strong>{product.name}</strong> (SKU: {product.sku}) is running low.</p>"
        f"<p>Current stock: {product.stock_quantity}<br>Reorder level: {product.reorder_level}</p>"
    )
    text = (
        f"Low stock alert: {product.name} (SKU: {product.sku}). "
        f"Stock: {product.stock_quantity}, reorder at: {product.reorder_level}."
    )
    sms = f"Low stock: {product.name}. Qty {product.stock_quantity}, reorder {product.reorder_level}."

    if settings.low_inventory_email_enabled:
        recipients = User.objects.filter(
            is_active=True,
            role__in=["SUPER_ADMIN", "MANAGER"],
            shop=product.shop,
        ).values_list("email", flat=True)
        for email in recipients:
            send_email(to_email=email, subject=subject, html_content=html, text_content=text)

    if settings.low_inventory_sms_enabled and settings.low_inventory_alert_phone:
        send_sms(to_phone=settings.low_inventory_alert_phone, message=sms)


def notify_new_customer(customer) -> None:
    settings = _get_settings(customer.shop)
    subject = "Welcome to Popy POS"
    html = f"<p>Hi {customer.name},</p><p>Your customer account has been created. We look forward to serving you.</p>"
    text = f"Hi {customer.name},\n\nYour customer account has been created."
    sms = f"Welcome {customer.name}! Your Popy POS account is ready."

    _dispatch(
        email_enabled=settings.new_customer_email_enabled,
        sms_enabled=settings.new_customer_sms_enabled,
        email=customer.email,
        phone=customer.phone,
        subject=subject,
        html=html,
        text=text,
        sms_text=sms,
    )


def notify_new_user(user, *, temporary_password: str | None = None) -> None:
    if not user.shop_id:
        return
    settings = _get_settings(user.shop)
    subject = "Your Popy POS account"
    password_line = f"<p><strong>Temporary password:</strong> {temporary_password}</p>" if temporary_password else ""
    html = (
        f"<p>Hi {user.name},</p>"
        f"<p>Your staff account has been created.</p>"
        f"<p><strong>Email:</strong> {user.email}<br><strong>Role:</strong> {user.role}</p>"
        f"{password_line}"
    )
    text = f"Hi {user.name},\n\nYour staff account has been created.\nEmail: {user.email}\nRole: {user.role}"
    if temporary_password:
        text += f"\nTemporary password: {temporary_password}"
    sms = f"Your Popy POS account is ready. Login: {user.email}"

    _dispatch(
        email_enabled=settings.new_user_email_enabled,
        sms_enabled=settings.new_user_sms_enabled,
        email=user.email,
        phone=None,
        subject=subject,
        html=html,
        text=text,
        sms_text=sms,
    )
