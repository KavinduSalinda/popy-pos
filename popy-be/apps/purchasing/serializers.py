from decimal import Decimal

from rest_framework import serializers

from apps.core.serializers import CamelCaseModelSerializer, CamelCaseSerializer
from apps.purchasing.models import Purchase, PurchaseItem


class PurchaseItemSerializer(CamelCaseModelSerializer):
    product_id = serializers.IntegerField(read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PurchaseItem
        fields = ["id", "product_id", "product_name", "quantity", "cost_price", "line_total"]


class PurchaseItemWriteSerializer(CamelCaseSerializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    cost_price = serializers.DecimalField(max_digits=12, decimal_places=2)


class PurchaseSerializer(CamelCaseModelSerializer):
    supplier_id = serializers.IntegerField(read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    items = PurchaseItemSerializer(many=True, read_only=True)

    class Meta:
        model = Purchase
        fields = [
            "id",
            "reference",
            "supplier_id",
            "supplier_name",
            "status",
            "items",
            "total",
            "note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["reference", "total", "status"]


class PurchaseCreateSerializer(CamelCaseSerializer):
    supplier_id = serializers.IntegerField()
    items = PurchaseItemWriteSerializer(many=True)
    note = serializers.CharField(required=False, allow_blank=True, default="")
    status = serializers.CharField(required=False, default="ORDERED")


class PurchaseUpdateSerializer(CamelCaseSerializer):
    supplier_id = serializers.IntegerField(required=False)
    items = PurchaseItemWriteSerializer(many=True, required=False)
    note = serializers.CharField(required=False, allow_blank=True)
