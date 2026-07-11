from decimal import Decimal

from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.catalog.models import Product
from apps.core.choices import StockTransactionType
from apps.core.permissions import HasPOSPermission
from apps.core.services import adjust_stock
from apps.core.shop_context import ShopScopedMixin
from apps.core.utils import generate_reference
from apps.parties.models import Customer
from apps.sales.models import Sale, SaleItem
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
        shop = self.shop
        serializer = SaleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        customer = None
        customer_id = data.get("customer_id")
        if customer_id:
            try:
                customer = Customer.objects.get(pk=customer_id, shop=shop)
            except Customer.DoesNotExist:
                return Response(
                    {"message": "Customer not found", "statusCode": 404},
                    status=status.HTTP_404_NOT_FOUND,
                )

        reference = generate_reference("SL", Sale, shop=shop)
        subtotal = Decimal("0")
        line_items = []

        for item_data in data["items"]:
            try:
                product = Product.objects.select_for_update().get(pk=item_data["product_id"], shop=shop)
            except Product.DoesNotExist:
                return Response(
                    {"message": "Product not found", "statusCode": 404},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if product.stock_quantity < item_data["quantity"]:
                return Response(
                    {
                        "message": f"Insufficient stock for {product.name}",
                        "statusCode": 400,
                        "errors": {"productId": [str(product.id)]},
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            line_total = Decimal(item_data["quantity"]) * item_data["unit_price"]
            subtotal += line_total
            line_items.append((product, item_data, line_total))

        discount = data.get("discount", Decimal("0"))
        tax = data.get("tax", Decimal("0"))
        total = subtotal - discount + tax

        sale = Sale.objects.create(
            shop=shop,
            reference=reference,
            customer=customer,
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            total=total,
            payment_method=data["payment_method"],
            amount_paid=data.get("amount_paid"),
            cashier=request.user,
        )

        for product, item_data, line_total in line_items:
            SaleItem.objects.create(
                sale=sale,
                product=product,
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total=line_total,
            )
            try:
                adjust_stock(
                    product,
                    -item_data["quantity"],
                    StockTransactionType.SALE,
                    note=f"Sale {reference}",
                    reference_type="Sale",
                    reference_id=sale.id,
                )
            except ValueError:
                transaction.set_rollback(True)
                return Response(
                    {"message": f"Insufficient stock for {product.name}", "statusCode": 400},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        sale = Sale.objects.select_related("customer", "cashier").prefetch_related("items__product").get(pk=sale.pk)

        from apps.core.notifications import notify_pos_checkout

        try:
            notify_pos_checkout(
                sale,
                send_email=data.get("send_email", False),
                send_sms=data.get("send_sms", False),
                user=request.user,
            )
        except Exception:
            pass

        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)
