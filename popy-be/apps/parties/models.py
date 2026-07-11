from django.db import models

from apps.core.models import TimeStampedModel
from apps.shops.models import Shop


class Customer(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="customers")
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    loyalty_points = models.IntegerField(default=0)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["shop", "phone"], name="uniq_customer_shop_phone"),
        ]

    def __str__(self):
        return self.name


class Supplier(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="suppliers")
    name = models.CharField(max_length=120)
    company_name = models.CharField(max_length=120, blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["shop", "phone"], name="uniq_supplier_shop_phone"),
        ]

    def __str__(self):
        return self.name
