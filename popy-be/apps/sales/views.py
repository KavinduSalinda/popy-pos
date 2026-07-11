from django.db import transaction
from rest_framework import status as http_status
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin
from apps.sales.models import Sale
from apps.sales.serializers import SaleCreateSerializer, SaleSerializer


class SaleViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Sale.objects.select_related("customer", "cashier").prefetch_related("items__product").all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "SALE_VIEW",
        "retrieve": "SALE_VIEW",
        "create": "SALE_CREATE",
    }
    http_method_names = ["get", "post", "head", "options"]
    search_fields = ["reference", "customer__name"]
    filterset_fields = ["payment_method"]

    def get_queryset(self):
        return self.filter_by_shop(super().get_queryset())

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        from apps.sync.services import SaleSyncError, create_sale_from_payload

        shop = self.shop
        serializer = SaleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            sale, sync_status = create_sale_from_payload(
                shop=shop,
                user=request.user,
                payload=request.data,
            )
        except SaleSyncError as exc:
            return Response(
                {"message": exc.message, "statusCode": exc.status_code, "errors": exc.errors},
                status=exc.status_code,
            )

        response_status = (
            http_status.HTTP_200_OK
            if sync_status == "duplicate"
            else http_status.HTTP_201_CREATED
        )
        return Response(SaleSerializer(sale).data, status=response_status)
