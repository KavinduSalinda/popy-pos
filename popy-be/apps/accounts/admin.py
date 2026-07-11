from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("email",)
    list_display = ("email", "name", "role", "shop", "is_active", "is_staff")
    list_filter = ("role", "shop", "is_active", "is_staff")
    search_fields = ("email", "name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal", {"fields": ("name", "role", "shop", "avatar_url")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "role", "shop", "password1", "password2"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        shop_id = request.GET.get("shop")
        if shop_id:
            initial["shop"] = shop_id
        return initial
