from django.contrib import admin

from apps.core.admin_mixins import ShopScopedModelAdmin
from apps.returns.models import PurchaseReturn, SalesReturn


@admin.register(SalesReturn)
class SalesReturnAdmin(ShopScopedModelAdmin):
    list_display = ("reference", "shop", "sale", "refund_amount", "created_at")


@admin.register(PurchaseReturn)
class PurchaseReturnAdmin(ShopScopedModelAdmin):
    list_display = ("reference", "shop", "purchase", "amount", "created_at")
