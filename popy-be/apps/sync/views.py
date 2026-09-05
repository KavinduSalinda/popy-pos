from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Category, Product
from apps.catalog.serializers import CategorySerializer, PosProductSerializer
from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin
from apps.core.utils import dict_to_camel_case
from apps.parties.models import Customer
from apps.parties.serializers import CustomerSerializer
from apps.sales.models import Sale
from apps.settings.models import NotificationSettings
from apps.sync.services import SaleSyncError, create_sale_from_payload, serialize_sale_result


class BootstrapSyncView(ShopScopedMixin, APIView):
    """Full POS offline bundle for initial IndexedDB seed."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "POS_ACCESS"

    def get(self, request):
        shop = self.shop
        products = Product.objects.select_related("category").filter(
            status=True, shop=shop
        )
        customers = Customer.objects.filter(shop=shop).order_by("name")[:200]
        settings = NotificationSettings.load(shop)
        pro = shop.is_pro

        return Response(
            dict_to_camel_case(
                {
                    "server_time": timezone.now().isoformat(),
                    "products": PosProductSerializer(products, many=True).data,
                    "customers": CustomerSerializer(customers, many=True).data,
                    "checkout_settings": {
                        "email_enabled": pro and settings.pos_checkout_email_enabled,
                        "sms_enabled": pro and settings.pos_checkout_sms_enabled,
                        "cashier_email_enabled": pro
                        and settings.pos_checkout_cashier_email_enabled,
                        "cashier_sms_enabled": pro
                        and settings.pos_checkout_cashier_sms_enabled,
                    },
                }
            )
        )


class CatalogSyncView(ShopScopedMixin, APIView):
    """Delta catalog sync using updated_at."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "PRODUCT_VIEW"

    def get(self, request):
        since = request.query_params.get("since")
        shop = self.shop

        products_qs = Product.objects.select_related("category").filter(shop=shop)
        categories_qs = Category.objects.filter(shop=shop)

        if since:
            products_qs = products_qs.filter(updated_at__gt=since)
            categories_qs = categories_qs.filter(updated_at__gt=since)

        from apps.catalog.serializers import ProductSerializer

        return Response(
            dict_to_camel_case(
                {
                    "server_time": timezone.now().isoformat(),
                    "products": ProductSerializer(products_qs, many=True).data,
                    "categories": CategorySerializer(categories_qs, many=True).data,
                }
            )
        )


class SalesSyncView(ShopScopedMixin, APIView):
    """Batch upload of offline sales with idempotent client IDs."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "SALE_CREATE"

    def post(self, request):
        sales_payload = request.data.get("sales") or request.data.get("Sales") or []
        if not isinstance(sales_payload, list):
            return Response(
                {"message": "sales must be an array", "statusCode": 400},
                status=400,
            )

        results = []
        for entry in sales_payload:
            client_id = entry.get("clientId") or entry.get("client_id")
            payload = entry.get("payload") or entry
            if client_id and "clientId" not in payload and "client_id" not in payload:
                payload = {**payload, "clientId": client_id}

            try:
                sale, status = create_sale_from_payload(
                    shop=self.shop,
                    user=request.user,
                    payload=payload,
                )
                results.append(serialize_sale_result(sale, client_id=client_id, status=status))
            except SaleSyncError as exc:
                results.append(
                    {
                        "clientId": client_id,
                        "status": "rejected",
                        "message": exc.message,
                        "errors": exc.errors,
                    }
                )

        return Response(dict_to_camel_case({"results": results, "syncedAt": timezone.now().isoformat()}))


class SyncStatusView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "POS_ACCESS"

    def get(self, request):
        shop = self.shop
        product_count = Product.objects.filter(shop=shop, status=True).count()
        customer_count = Customer.objects.filter(shop=shop).count()
        offline_sales = (
            Sale.objects.filter(shop=shop, client_id__isnull=False)
            .order_by("-created_at")[:5]
            .values("id", "reference", "client_id", "created_at")
        )

        return Response(
            dict_to_camel_case(
                {
                    "server_time": timezone.now().isoformat(),
                    "product_count": product_count,
                    "customer_count": customer_count,
                    "recent_synced_sales": list(offline_sales),
                }
            )
        )
