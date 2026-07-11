from decimal import Decimal

from django.db import transaction
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.catalog.models import Product
from apps.core.choices import PurchaseStatus, StockTransactionType
from apps.core.permissions import HasPOSPermission
from apps.core.services import adjust_stock
from apps.core.shop_context import ShopScopedMixin
from apps.core.utils import generate_reference
from apps.parties.models import Supplier
from apps.purchasing.models import Purchase, PurchaseItem
from apps.purchasing.serializers import (
    PurchaseCreateSerializer,
    PurchaseSerializer,
    PurchaseUpdateSerializer,
)

EDITABLE_STATUSES = {PurchaseStatus.DRAFT, PurchaseStatus.ORDERED}
DELETABLE_STATUSES = {PurchaseStatus.DRAFT, PurchaseStatus.ORDERED, PurchaseStatus.CANCELLED}


def _bad_request(message, errors=None):
    payload = {"message": message, "statusCode": 400}
    if errors:
        payload["errors"] = errors
    return Response(payload, status=status.HTTP_400_BAD_REQUEST)


def _add_line_items(purchase, items_data, shop, adjust_inventory=False):
    total = Decimal("0")
    reference = purchase.reference

    for item_data in items_data:
        product = Product.objects.select_for_update().get(pk=item_data["product_id"], shop=shop)
        line_total = Decimal(item_data["quantity"]) * item_data["cost_price"]
        PurchaseItem.objects.create(
            purchase=purchase,
            product=product,
            quantity=item_data["quantity"],
            cost_price=item_data["cost_price"],
            line_total=line_total,
        )
        total += line_total

        if adjust_inventory:
            adjust_stock(
                product,
                item_data["quantity"],
                StockTransactionType.PURCHASE,
                note=f"Purchase {reference}",
                reference_type="Purchase",
                reference_id=purchase.id,
            )
            product.cost_price = item_data["cost_price"]
            product.save(update_fields=["cost_price", "updated_at"])

    return total


class PurchaseViewSet(
    ShopScopedMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Purchase.objects.select_related("supplier").prefetch_related("items__product").all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "PURCHASE_VIEW",
        "retrieve": "PURCHASE_VIEW",
        "create": "PURCHASE_MANAGE",
        "update": "PURCHASE_MANAGE",
        "partial_update": "PURCHASE_MANAGE",
        "destroy": "PURCHASE_MANAGE",
        "receive": "PURCHASE_MANAGE",
        "cancel": "PURCHASE_MANAGE",
    }
    filterset_fields = ["status"]
    search_fields = ["reference", "supplier__name"]

    def get_queryset(self):
        return self.filter_by_shop(super().get_queryset())

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        shop = self.shop
        serializer = PurchaseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if not data.get("items"):
            return _bad_request("Validation error", {"items": ["At least one item is required."]})

        try:
            supplier = Supplier.objects.get(pk=data["supplier_id"], shop=shop)
        except Supplier.DoesNotExist:
            return Response(
                {"message": "Supplier not found", "statusCode": 404},
                status=status.HTTP_404_NOT_FOUND,
            )

        purchase_status = data.get("status", PurchaseStatus.ORDERED)
        if purchase_status not in PurchaseStatus.values:
            purchase_status = PurchaseStatus.ORDERED

        reference = generate_reference("PO", Purchase, shop=shop)
        purchase = Purchase.objects.create(
            shop=shop,
            reference=reference,
            supplier=supplier,
            status=purchase_status,
            note=data.get("note", ""),
            total=Decimal("0"),
        )

        adjust_inventory = purchase_status == PurchaseStatus.RECEIVED
        total = _add_line_items(purchase, data["items"], shop, adjust_inventory=adjust_inventory)

        purchase.total = total
        purchase.save(update_fields=["total", "updated_at"])

        purchase = self.get_queryset().get(pk=purchase.pk)
        return Response(PurchaseSerializer(purchase).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        purchase = self.get_object()

        if purchase.status not in EDITABLE_STATUSES:
            return _bad_request("Only draft or ordered purchases can be updated")

        serializer = PurchaseUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "supplier_id" in data:
            try:
                purchase.supplier = Supplier.objects.get(pk=data["supplier_id"], shop=self.shop)
            except Supplier.DoesNotExist:
                return Response(
                    {"message": "Supplier not found", "statusCode": 404},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if "note" in data:
            purchase.note = data["note"]

        if "items" in data:
            if not data["items"]:
                return _bad_request("Validation error", {"items": ["At least one item is required."]})
            purchase.items.all().delete()
            purchase.total = _add_line_items(purchase, data["items"], self.shop)

        purchase.save()
        purchase = self.get_queryset().get(pk=purchase.pk)
        return Response(PurchaseSerializer(purchase).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        purchase = self.get_object()

        if purchase.status not in DELETABLE_STATUSES:
            return _bad_request("Received or partial purchases cannot be deleted")

        purchase.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="receive")
    @transaction.atomic
    def receive(self, request, pk=None):
        purchase = self.get_object()

        if purchase.status not in (PurchaseStatus.ORDERED, PurchaseStatus.PARTIAL):
            return _bad_request("Only ordered purchases can be received")

        for item in purchase.items.select_related("product"):
            product = Product.objects.select_for_update().get(pk=item.product_id, shop=self.shop)
            adjust_stock(
                product,
                item.quantity,
                StockTransactionType.PURCHASE,
                note=f"GRN {purchase.reference}",
                reference_type="Purchase",
                reference_id=purchase.id,
            )
            product.cost_price = item.cost_price
            product.save(update_fields=["cost_price", "updated_at"])

        purchase.status = PurchaseStatus.RECEIVED
        purchase.save(update_fields=["status", "updated_at"])

        purchase = self.get_queryset().get(pk=purchase.pk)
        return Response(PurchaseSerializer(purchase).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    @transaction.atomic
    def cancel(self, request, pk=None):
        purchase = self.get_object()

        if purchase.status != PurchaseStatus.ORDERED:
            return _bad_request("Only ordered purchases can be cancelled")

        purchase.status = PurchaseStatus.CANCELLED
        purchase.save(update_fields=["status", "updated_at"])

        purchase = self.get_queryset().get(pk=purchase.pk)
        return Response(PurchaseSerializer(purchase).data)
