from django.db import models

from apps.core.models import TimeStampedModel
from apps.purchasing.models import Purchase
from apps.sales.models import Sale
from apps.shops.models import Shop


class SalesReturn(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="sales_returns")
    reference = models.CharField(max_length=32)
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name="returns")
    reason = models.TextField()
    refund_amount = models.DecimalField(max_digits=14, decimal_places=2)
    items = models.JSONField(default=list)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["shop", "reference"], name="uniq_sales_return_shop_reference"),
        ]


class PurchaseReturn(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="purchase_returns")
    reference = models.CharField(max_length=32)
    purchase = models.ForeignKey(Purchase, on_delete=models.PROTECT, related_name="returns")
    reason = models.TextField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    items = models.JSONField(default=list)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["shop", "reference"], name="uniq_purchase_return_shop_reference"),
        ]
