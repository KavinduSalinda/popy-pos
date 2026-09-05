from django.conf import settings
from django.db import models

from apps.core.choices import ShopPlan
from apps.core.models import TimeStampedModel


class Shop(TimeStampedModel):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=32, unique=True, db_index=True)
    address = models.TextField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(max_length=255, blank=True, default="")
    is_active = models.BooleanField(default=True)
    plan = models.CharField(
        max_length=16,
        choices=ShopPlan.choices,
        default=ShopPlan.FREE,
        db_index=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def is_pro(self) -> bool:
        return self.plan == ShopPlan.PRO
