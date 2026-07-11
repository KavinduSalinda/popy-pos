from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Category, Product
from apps.catalog.serializers import CategorySerializer, PosProductSerializer, ProductSerializer
from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin


class ProductViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "PRODUCT_VIEW",
        "retrieve": "PRODUCT_VIEW",
        "create": "PRODUCT_CREATE",
        "update": "PRODUCT_UPDATE",
        "partial_update": "PRODUCT_UPDATE",
        "destroy": "PRODUCT_DELETE",
    }
    filterset_fields = ["category", "status"]
    search_fields = ["name", "sku", "barcode"]

    def get_queryset(self):
        return self.filter_by_shop(super().get_queryset())


class CategoryViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Category.objects.annotate(product_count=Count("products")).all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "CATEGORY_VIEW",
        "retrieve": "CATEGORY_VIEW",
        "create": "CATEGORY_MANAGE",
        "update": "CATEGORY_MANAGE",
        "partial_update": "CATEGORY_MANAGE",
        "destroy": "CATEGORY_MANAGE",
    }
    pagination_class = None
    search_fields = ["name"]

    def get_queryset(self):
        return self.filter_by_shop(super().get_queryset())

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PosProductListView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "POS_ACCESS"

    def get(self, request):
        search = request.query_params.get("search", "")
        qs = Product.objects.select_related("category").filter(status=True, shop=self.shop)
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(sku__icontains=search) | Q(barcode__icontains=search)
            )
        serializer = PosProductSerializer(qs, many=True)
        return Response(serializer.data)


class PosProductLookupView(ShopScopedMixin, APIView):
    """Exact match by SKU or barcode for POS scanners."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "POS_ACCESS"

    def get(self, request):
        code = request.query_params.get("code", "").strip()
        if not code:
            return Response(
                {"message": "Barcode or SKU is required", "statusCode": 400},
                status=400,
            )

        product = (
            Product.objects.select_related("category")
            .filter(status=True, shop=self.shop)
            .filter(Q(sku__iexact=code) | Q(barcode__iexact=code))
            .first()
        )

        if not product:
            return Response(
                {"message": f'No product found for "{code}"', "statusCode": 404},
                status=404,
            )

        return Response(PosProductSerializer(product).data)
