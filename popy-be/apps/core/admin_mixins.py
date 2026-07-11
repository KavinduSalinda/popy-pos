"""Shared Django admin helpers for multi-shop models."""

from django.contrib import admin


class ShopScopedModelAdmin(admin.ModelAdmin):
    """Show and filter records by shop in the admin."""

    list_filter = ("shop",)

    def get_list_display(self, request):
        display = list(super().get_list_display(request))
        if "shop" not in display:
            display.append("shop")
        return display
