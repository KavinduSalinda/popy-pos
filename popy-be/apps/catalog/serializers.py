from rest_framework import serializers

from apps.catalog.models import Category, Product
from apps.core.serializers import CamelCaseModelSerializer


class CategorySerializer(CamelCaseModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "description", "product_count", "created_at", "updated_at"]


class ProductSerializer(CamelCaseModelSerializer):
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all()
    )
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "barcode",
            "category_id",
            "category_name",
            "brand",
            "unit",
            "cost_price",
            "selling_price",
            "reorder_level",
            "stock_quantity",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["stock_quantity"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        shop = self.context.get("shop")
        if shop is not None:
            self.fields["category_id"].queryset = Category.objects.filter(shop=shop)


class PosProductSerializer(CamelCaseModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "barcode",
            "selling_price",
            "stock_quantity",
            "category_name",
        ]
