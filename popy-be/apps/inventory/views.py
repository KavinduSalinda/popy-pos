from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.core.choices import StockTransactionType
from apps.core.permissions import HasPOSPermission
from apps.core.services import adjust_stock
from apps.core.shop_context import ShopScopedMixin
from apps.inventory.models import StockAdjustment, StockTransaction
from apps.inventory.serializers import (
    InventoryRowSerializer,
    StockAdjustmentCreateSerializer,
    StockTransactionSerializer,
)


def inventory_status(product: Product) -> str:
    if product.stock_quantity <= 0:
        return "out"
    if product.stock_quantity <= product.reorder_level:
        return "low"
    return "in"


def product_to_inventory_row(product: Product) -> dict:
    return {
        "id": product.id,
        "product_id": product.id,
        "product_name": product.name,
        "sku": product.sku,
        "stock_quantity": product.stock_quantity,
        "reorder_level": product.reorder_level,
        "status": inventory_status(product),
    }


class InventoryViewSet(ShopScopedMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "INVENTORY_VIEW",
        "retrieve": "INVENTORY_VIEW",
    }
    serializer_class = InventoryRowSerializer

    def get_queryset(self):
        return Product.objects.filter(shop=self.shop).order_by("name")

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        search = request.query_params.get("search", "")
        stock_status = request.query_params.get("status", "")

        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(sku__icontains=search) | Q(barcode__icontains=search)
            )

        rows = [product_to_inventory_row(p) for p in qs]
        if stock_status in ("low", "out", "in"):
            rows = [r for r in rows if r["status"] == stock_status]

        page = self.paginate_queryset(rows)
        if page is not None:
            serializer = InventoryRowSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = InventoryRowSerializer(rows, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        product = Product.objects.get(pk=kwargs["pk"], shop=self.shop)
        serializer = InventoryRowSerializer(product_to_inventory_row(product))
        return Response(serializer.data)


class StockTransactionListView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "INVENTORY_VIEW"

    def get(self, request):
        qs = StockTransaction.objects.select_related("product").filter(product__shop=self.shop)
        search = request.query_params.get("search", "")
        if search:
            qs = qs.filter(
                Q(product__name__icontains=search)
                | Q(product__sku__icontains=search)
                | Q(note__icontains=search)
            )

        from apps.core.pagination import POSPagination

        paginator = POSPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = StockTransactionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class StockAdjustmentCreateView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "INVENTORY_ADJUST"

    @transaction.atomic
    def post(self, request):
        serializer = StockAdjustmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            product = Product.objects.select_for_update().get(pk=data["product_id"], shop=self.shop)
        except Product.DoesNotExist:
            return Response(
                {"message": "Product not found", "statusCode": 404},
                status=status.HTTP_404_NOT_FOUND,
            )

        quantity = data["quantity"]
        try:
            adjust_stock(
                product,
                quantity,
                StockTransactionType.ADJUSTMENT,
                note=data.get("note", ""),
                reference_type="StockAdjustment",
            )
        except ValueError as exc:
            return Response(
                {"message": str(exc), "statusCode": 400},
                status=status.HTTP_400_BAD_REQUEST,
            )

        StockAdjustment.objects.create(
            product=product,
            adjustment_type=data["adjustment_type"],
            quantity=quantity,
            note=data.get("note", ""),
            user=request.user,
        )

        tx = product.stock_transactions.first()
        return Response(StockTransactionSerializer(tx).data, status=status.HTTP_201_CREATED)
