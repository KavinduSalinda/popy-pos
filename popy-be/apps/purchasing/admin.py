from django.contrib import admin

from apps.core.admin_mixins import ShopScopedModelAdmin
from apps.purchasing.models import Purchase, PurchaseItem


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 0


@admin.register(Purchase)
class PurchaseAdmin(ShopScopedModelAdmin):
    list_display = ("reference", "shop", "supplier", "status", "total", "created_at")
    inlines = [PurchaseItemInline]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "supplier":
            object_id = request.resolver_match.kwargs.get("object_id")
            if object_id:
                purchase = Purchase.objects.filter(pk=object_id).select_related("shop").first()
                if purchase and purchase.shop_id:
                    kwargs["queryset"] = db_field.related_model.objects.filter(shop_id=purchase.shop_id)
            elif request.GET.get("shop"):
                kwargs["queryset"] = db_field.related_model.objects.filter(shop_id=request.GET["shop"])
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
