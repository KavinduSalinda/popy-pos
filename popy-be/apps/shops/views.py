from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import get_accessible_shops
from apps.core.utils import dict_to_camel_case
from apps.shops.models import Shop
from apps.shops.serializers import ShopSerializer


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all().order_by("name")
    serializer_class = ShopSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "SHOP_MANAGE",
        "retrieve": "SHOP_MANAGE",
        "create": "SHOP_MANAGE",
        "update": "SHOP_MANAGE",
        "partial_update": "SHOP_MANAGE",
        "destroy": "SHOP_MANAGE",
    }
    search_fields = ["name", "code"]
    shop_required = False

    def get_queryset(self):
        return Shop.objects.all().order_by("name")


class AccessibleShopsView(APIView):
    """Shops the current user may work in (for the shop switcher)."""

    permission_classes = [IsAuthenticated]
    shop_required = False

    def get(self, request):
        shops = get_accessible_shops(request.user)
        data = ShopSerializer(shops, many=True).data
        default_shop_id = request.user.shop_id or (shops.first().id if shops.exists() else None)
        return Response(
            {
                "shops": data,
                "defaultShopId": default_shop_id,
            }
        )
