from django.conf import settings
from django.db import models

from apps.catalog.models import Product
from apps.core.choices import AdjustmentType, StockTransactionType
from apps.core.models import TimeStampedModel


class StockTransaction(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_transactions")
    type = models.CharField(max_length=20, choices=StockTransactionType.choices)
    quantity = models.IntegerField()
    balance = models.IntegerField()
    note = models.CharField(max_length=255, blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, default="")
    reference_id = models.BigIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.sku} {self.type} {self.quantity}"


class StockAdjustment(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="adjustments")
    adjustment_type = models.CharField(max_length=20, choices=AdjustmentType.choices)
    quantity = models.IntegerField()
    note = models.TextField(blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="stock_adjustments",
    )

    def __str__(self):
        return f"{self.product.sku} {self.adjustment_type}"
