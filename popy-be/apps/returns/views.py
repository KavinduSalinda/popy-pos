from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.core.choices import StockTransactionType
from apps.core.permissions import HasPOSPermission
from apps.core.services import adjust_stock
from apps.core.shop_context import ShopScopedMixin
from apps.core.utils import generate_reference
from apps.purchasing.models import Purchase
from apps.returns.models import PurchaseReturn, SalesReturn
from apps.returns.serializers import (
    PurchaseReturnCreateSerializer,
    PurchaseReturnSerializer,
    SalesReturnCreateSerializer,
    SalesReturnSerializer,
)
from apps.sales.models import Sale


class ReturnViewSet(ShopScopedMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "RETURN_VIEW"

    def list(self, request, *args, **kwargs):
        shop = self.shop
        sales = SalesReturnSerializer(
            SalesReturn.objects.filter(shop=shop).order_by("-created_at")[:50],
            many=True,
        ).data
        purchases = PurchaseReturnSerializer(
            PurchaseReturn.objects.filter(shop=shop).order_by("-created_at")[:50],
            many=True,
        ).data
        combined = sorted(sales + purchases, key=lambda x: x.get("createdAt", ""), reverse=True)
        return Response(combined)


class SalesReturnCreateView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "RETURN_CREATE"

    @transaction.atomic
    def post(self, request):
        shop = self.shop
        serializer = SalesReturnCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            sale = Sale.objects.prefetch_related("items__product").get(pk=data["sale_id"], shop=shop)
        except Sale.DoesNotExist:
            return Response(
                {"message": "Sale not found", "statusCode": 404},
                status=status.HTTP_404_NOT_FOUND,
            )

        reference = generate_reference("SR", SalesReturn, shop=shop)
        items = data.get("items") or []

        if not items:
            for sale_item in sale.items.all():
                adjust_stock(
                    sale_item.product,
                    sale_item.quantity,
                    StockTransactionType.RETURN,
                    note=f"Sales return {reference}",
                    reference_type="SalesReturn",
                )
        else:
            for item in items:
                product_id = item.get("productId") or item.get("product_id")
                quantity = item.get("quantity", 0)
                if product_id and quantity:
                    product = Product.objects.select_for_update().get(pk=product_id, shop=shop)
                    adjust_stock(
                        product,
                        quantity,
                        StockTransactionType.RETURN,
                        note=f"Sales return {reference}",
                        reference_type="SalesReturn",
                    )

        sales_return = SalesReturn.objects.create(
            shop=shop,
            reference=reference,
            sale=sale,
            reason=data["reason"],
            refund_amount=data["refund_amount"],
            items=items,
        )
        return Response(SalesReturnSerializer(sales_return).data, status=status.HTTP_201_CREATED)


class PurchaseReturnCreateView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "RETURN_CREATE"

    @transaction.atomic
    def post(self, request):
        shop = self.shop
        serializer = PurchaseReturnCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            purchase = Purchase.objects.prefetch_related("items__product").get(
                pk=data["purchase_id"], shop=shop
            )
        except Purchase.DoesNotExist:
            return Response(
                {"message": "Purchase not found", "statusCode": 404},
                status=status.HTTP_404_NOT_FOUND,
            )

        reference = generate_reference("PR", PurchaseReturn, shop=shop)
        items = data.get("items") or []

        if not items:
            for purchase_item in purchase.items.all():
                try:
                    adjust_stock(
                        purchase_item.product,
                        -purchase_item.quantity,
                        StockTransactionType.RETURN,
                        note=f"Purchase return {reference}",
                        reference_type="PurchaseReturn",
                    )
                except ValueError:
                    pass
        else:
            for item in items:
                product_id = item.get("productId") or item.get("product_id")
                quantity = item.get("quantity", 0)
                if product_id and quantity:
                    product = Product.objects.select_for_update().get(pk=product_id, shop=shop)
                    adjust_stock(
                        product,
                        -quantity,
                        StockTransactionType.RETURN,
                        note=f"Purchase return {reference}",
                        reference_type="PurchaseReturn",
                    )

        purchase_return = PurchaseReturn.objects.create(
            shop=shop,
            reference=reference,
            purchase=purchase,
            reason=data["reason"],
            amount=data["amount"],
            items=items,
        )
        return Response(
            PurchaseReturnSerializer(purchase_return).data,
            status=status.HTTP_201_CREATED,
        )
