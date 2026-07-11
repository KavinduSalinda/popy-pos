from django.contrib import admin

from apps.core.admin_mixins import ShopScopedModelAdmin
from apps.parties.models import Customer, Supplier


@admin.register(Customer)
class CustomerAdmin(ShopScopedModelAdmin):
    list_display = ("name", "phone", "shop", "email", "loyalty_points")
    search_fields = ("name", "phone", "email")


@admin.register(Supplier)
class SupplierAdmin(ShopScopedModelAdmin):
    list_display = ("name", "company_name", "shop", "phone", "email")
    search_fields = ("name", "company_name", "phone")
