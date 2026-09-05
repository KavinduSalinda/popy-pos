from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from apps.accounts.models import User
from apps.catalog.models import Category
from apps.parties.models import Customer, Supplier
from apps.settings.models import NotificationSettings
from apps.shops.models import Shop


class ShopTabularInline(admin.TabularInline):
    """Base inline for shop detail tabs."""

    extra = 0
    show_change_link = True


class UserInline(ShopTabularInline):
    model = User
    fields = ("email", "name", "role", "is_active", "is_staff")
    ordering = ("email",)

    def has_add_permission(self, request, obj=None):
        return False


class CategoryInline(ShopTabularInline):
    model = Category
    fields = ("name", "description")
    extra = 1


class CustomerInline(ShopTabularInline):
    model = Customer
    fields = ("name", "phone", "email", "loyalty_points")
    extra = 1


class SupplierInline(ShopTabularInline):
    model = Supplier
    fields = ("name", "company_name", "phone", "email")
    extra = 1


class NotificationSettingsInline(admin.StackedInline):
    model = NotificationSettings
    extra = 0
    max_num = 1
    can_delete = False
    fieldsets = (
        (
            "POS checkout",
            {
                "fields": (
                    "pos_checkout_email_enabled",
                    "pos_checkout_sms_enabled",
                    "pos_checkout_cashier_email_enabled",
                    "pos_checkout_cashier_sms_enabled",
                ),
            },
        ),
        (
            "Inventory",
            {
                "fields": (
                    "low_inventory_email_enabled",
                    "low_inventory_sms_enabled",
                    "low_inventory_alert_phone",
                ),
            },
        ),
        (
            "Onboarding",
            {
                "fields": (
                    "new_customer_email_enabled",
                    "new_customer_sms_enabled",
                    "new_user_email_enabled",
                    "new_user_sms_enabled",
                ),
            },
        ),
    )


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "plan", "phone", "is_active", "updated_at")
    list_filter = ("is_active", "plan")
    search_fields = ("name", "code")

    fieldsets = (
        (None, {"fields": ("name", "code", "address", "phone", "email", "is_active", "plan")}),
        ("Links", {"fields": ("manage_users_link",)}),
    )
    readonly_fields = ("manage_users_link",)

    inlines = [
        UserInline,
        CategoryInline,
        CustomerInline,
        SupplierInline,
        NotificationSettingsInline,
    ]

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        NotificationSettings.load(form.instance)

    @admin.display(description="Users")
    def manage_users_link(self, obj):
        if not obj.pk:
            return "Save the shop first to manage related records."
        url = reverse("admin:accounts_user_add") + f"?shop={obj.pk}"
        return format_html('<a class="button" href="{}">Add user for this shop</a>', url)

    def get_fieldsets(self, request, obj=None):
        if obj is None:
            return (
                (None, {"fields": ("name", "code", "address", "phone", "email", "is_active", "plan")}),
            )
        return super().get_fieldsets(request, obj)
