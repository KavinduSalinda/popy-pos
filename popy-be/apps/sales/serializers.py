from decimal import Decimal

from rest_framework import serializers

from apps.core.choices import PaymentMethod
from apps.core.serializers import CamelCaseModelSerializer, CamelCaseSerializer
from apps.sales.models import Sale, SaleItem


class SaleItemSerializer(CamelCaseModelSerializer):
    product_id = serializers.IntegerField(read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = SaleItem
        fields = ["id", "product_id", "product_name", "sku", "quantity", "unit_price", "total"]


class SaleSerializer(CamelCaseModelSerializer):
    customer_id = serializers.IntegerField(read_only=True, allow_null=True)
    customer_name = serializers.SerializerMethodField()
    cashier_name = serializers.CharField(source="cashier.name", read_only=True)
    shop_name = serializers.CharField(source="shop.name", read_only=True)
    shop_phone = serializers.CharField(source="shop.phone", read_only=True)
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id",
            "reference",
            "customer_id",
            "customer_name",
            "shop_name",
            "shop_phone",
            "items",
            "subtotal",
            "discount",
            "tax",
            "total",
            "payment_method",
            "amount_paid",
            "cashier_name",
            "created_at",
        ]

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else "Walk-in"


class SaleItemWriteSerializer(CamelCaseSerializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=14, decimal_places=3, min_value=Decimal("0.001"))
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)


class SaleCreateSerializer(CamelCaseSerializer):
    client_id = serializers.CharField(required=False, allow_blank=True, max_length=36)
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    items = SaleItemWriteSerializer(many=True)
    discount = serializers.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    tax = serializers.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0"))
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices)
    amount_paid = serializers.DecimalField(
        max_digits=14, decimal_places=2, required=False, allow_null=True
    )
    send_email = serializers.BooleanField(default=False, required=False)
    send_sms = serializers.BooleanField(default=False, required=False)
