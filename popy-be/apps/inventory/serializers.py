from rest_framework import serializers

from apps.core.choices import AdjustmentType
from apps.core.serializers import CamelCaseModelSerializer, CamelCaseSerializer
from apps.inventory.models import StockAdjustment, StockTransaction


class InventoryRowSerializer(CamelCaseSerializer):
    id = serializers.IntegerField()
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    sku = serializers.CharField()
    stock_quantity = serializers.DecimalField(max_digits=14, decimal_places=3)
    reorder_level = serializers.IntegerField()
    status = serializers.CharField()


class StockTransactionSerializer(CamelCaseModelSerializer):
    product_id = serializers.IntegerField(read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockTransaction
        fields = [
            "id",
            "product_id",
            "product_name",
            "type",
            "quantity",
            "balance",
            "note",
            "created_at",
        ]


class StockAdjustmentCreateSerializer(CamelCaseSerializer):
    product_id = serializers.IntegerField()
    adjustment_type = serializers.ChoiceField(choices=AdjustmentType.choices)
    quantity = serializers.DecimalField(max_digits=14, decimal_places=3)
    note = serializers.CharField(required=False, allow_blank=True, default="")
