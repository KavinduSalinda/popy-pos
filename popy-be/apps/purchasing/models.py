from django.db import models

from apps.catalog.models import Product
from apps.core.choices import PurchaseStatus
from apps.core.models import TimeStampedModel
from apps.parties.models import Supplier
from apps.shops.models import Shop


class Purchase(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="purchases")
    reference = models.CharField(max_length=32)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name="purchases")
    status = models.CharField(max_length=20, choices=PurchaseStatus.choices, default=PurchaseStatus.ORDERED)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    note = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["shop", "reference"], name="uniq_purchase_shop_reference"),
        ]

    def __str__(self):
        return self.reference


class PurchaseItem(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=14, decimal_places=2)

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.cost_price
        super().save(*args, **kwargs)
