from django.contrib import admin

from apps.catalog.models import Category, Product
from apps.core.admin_mixins import ShopScopedModelAdmin


@admin.register(Category)
class CategoryAdmin(ShopScopedModelAdmin):
    list_display = ("name", "shop", "created_at")
    search_fields = ("name",)


@admin.register(Product)
class ProductAdmin(ShopScopedModelAdmin):
    list_display = ("name", "sku", "shop", "category", "stock_quantity", "status")
    list_filter = ("status", "category", "shop")
    search_fields = ("name", "sku", "barcode")

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            object_id = request.resolver_match.kwargs.get("object_id")
            if object_id:
                product = Product.objects.filter(pk=object_id).select_related("shop").first()
                if product and product.shop_id:
                    kwargs["queryset"] = Category.objects.filter(shop_id=product.shop_id)
            elif request.GET.get("shop"):
                kwargs["queryset"] = Category.objects.filter(shop_id=request.GET["shop"])
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
