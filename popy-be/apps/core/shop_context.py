from rest_framework.exceptions import NotAuthenticated, PermissionDenied, ValidationError

from apps.core.choices import Role
from apps.shops.models import Shop

SHOP_HEADER = "HTTP_X_SHOP_ID"


def get_accessible_shops(user):
    if not user or not user.is_authenticated:
        return Shop.objects.none()
    if user.role == Role.SUPER_ADMIN:
        return Shop.objects.filter(is_active=True).order_by("name")
    if user.shop_id:
        return Shop.objects.filter(pk=user.shop_id, is_active=True)
    return Shop.objects.none()


def resolve_shop(request):
    user = request.user
    if not user or not user.is_authenticated:
        raise NotAuthenticated()

    shop_id = request.headers.get("X-Shop-Id") or request.META.get(SHOP_HEADER)
    if not shop_id and user.shop_id:
        shop_id = str(user.shop_id)

    if not shop_id:
        raise ValidationError({"message": "Shop context is required (X-Shop-Id header)", "statusCode": 400})

    try:
        shop = Shop.objects.get(pk=int(shop_id), is_active=True)
    except (Shop.DoesNotExist, ValueError, TypeError):
        raise PermissionDenied("Invalid or inactive shop")

    if user.role != Role.SUPER_ADMIN and user.shop_id != shop.id:
        raise PermissionDenied("You do not have access to this shop")

    return shop


class ShopScopedMixin:
    """Attach current shop and filter querysets for multi-shop isolation."""

    shop_required = True

    @property
    def shop(self):
        if not hasattr(self, "_shop"):
            self._shop = resolve_shop(self.request)
        return self._shop

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.shop_required:
            context["shop"] = self.shop
        return context

    def filter_by_shop(self, queryset):
        return queryset.filter(shop=self.shop)

    def perform_create(self, serializer):
        serializer.save(shop=self.shop)
