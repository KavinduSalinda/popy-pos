from django.contrib import admin

from apps.inventory.models import StockAdjustment, StockTransaction


@admin.register(StockTransaction)
class StockTransactionAdmin(admin.ModelAdmin):
    list_display = ("product", "type", "quantity", "balance", "created_at")
    list_filter = ("type",)


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ("product", "adjustment_type", "quantity", "user", "created_at")
