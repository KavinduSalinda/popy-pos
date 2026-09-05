from django.db import models

from apps.core.models import TimeStampedModel
from apps.shops.models import Shop


class NotificationSettings(TimeStampedModel):
    """Per-shop notification toggles (Pro plan feature)."""

    shop = models.OneToOneField(Shop, on_delete=models.CASCADE, related_name="notification_settings")

    pos_checkout_email_enabled = models.BooleanField(default=False)
    pos_checkout_sms_enabled = models.BooleanField(default=False)
    pos_checkout_cashier_email_enabled = models.BooleanField(default=False)
    pos_checkout_cashier_sms_enabled = models.BooleanField(default=False)

    low_inventory_email_enabled = models.BooleanField(default=False)
    low_inventory_sms_enabled = models.BooleanField(default=False)
    low_inventory_alert_phone = models.CharField(max_length=20, blank=True, default="")

    new_customer_email_enabled = models.BooleanField(default=False)
    new_customer_sms_enabled = models.BooleanField(default=False)

    new_user_email_enabled = models.BooleanField(default=False)
    new_user_sms_enabled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "notification settings"
        verbose_name_plural = "notification settings"

    @classmethod
    def load(cls, shop: Shop) -> "NotificationSettings":
        obj, _ = cls.objects.get_or_create(shop=shop)
        return obj

    def __str__(self):
        return f"Notification Settings — {self.shop.name}"
