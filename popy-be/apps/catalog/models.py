from django.db import models

from apps.core.models import TimeStampedModel
from apps.shops.models import Shop


class Category(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=80)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["shop", "name"], name="uniq_category_shop_name"),
        ]

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=120)
    sku = models.CharField(max_length=60, db_index=True)
    barcode = models.CharField(max_length=60, blank=True, null=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    brand = models.CharField(max_length=80, blank=True, null=True)
    unit = models.CharField(max_length=20)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2)
    reorder_level = models.IntegerField(default=0)
    stock_quantity = models.DecimalField(max_digits=14, decimal_places=3, default=0)
    status = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["shop", "name"]),
            models.Index(fields=["shop", "category"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["shop", "sku"], name="uniq_product_shop_sku"),
            models.UniqueConstraint(
                fields=["shop", "barcode"],
                condition=models.Q(barcode__isnull=False),
                name="uniq_product_shop_barcode",
            ),
        ]

    def __str__(self):
        return self.name
