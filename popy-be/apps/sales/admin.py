from django.contrib import admin

from apps.core.admin_mixins import ShopScopedModelAdmin
from apps.sales.models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0


@admin.register(Sale)
class SaleAdmin(ShopScopedModelAdmin):
    list_display = ("reference", "shop", "customer", "total", "payment_method", "created_at")
    inlines = [SaleItemInline]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "customer":
            object_id = request.resolver_match.kwargs.get("object_id")
            if object_id:
                sale = Sale.objects.filter(pk=object_id).select_related("shop").first()
                if sale and sale.shop_id:
                    kwargs["queryset"] = db_field.related_model.objects.filter(shop_id=sale.shop_id)
            elif request.GET.get("shop"):
                kwargs["queryset"] = db_field.related_model.objects.filter(shop_id=request.GET["shop"])
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
