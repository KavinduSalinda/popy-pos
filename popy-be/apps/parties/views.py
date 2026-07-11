from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin
from apps.parties.models import Customer, Supplier
from apps.parties.serializers import CustomerSerializer, SupplierSerializer


class CustomerViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "CUSTOMER_VIEW",
        "retrieve": "CUSTOMER_VIEW",
        "create": "CUSTOMER_MANAGE",
        "update": "CUSTOMER_MANAGE",
        "partial_update": "CUSTOMER_MANAGE",
        "destroy": "CUSTOMER_MANAGE",
    }
    search_fields = ["name", "phone", "email"]

    def get_queryset(self):
        return self.filter_by_shop(super().get_queryset())

    def perform_create(self, serializer):
        customer = serializer.save(shop=self.shop)
        from apps.core.notifications import notify_new_customer

        try:
            notify_new_customer(customer)
        except Exception:
            pass


class SupplierViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "SUPPLIER_VIEW",
        "retrieve": "SUPPLIER_VIEW",
        "create": "SUPPLIER_MANAGE",
        "update": "SUPPLIER_MANAGE",
        "partial_update": "SUPPLIER_MANAGE",
        "destroy": "SUPPLIER_MANAGE",
    }
    search_fields = ["name", "company_name", "phone", "email"]

    def get_queryset(self):
        return self.filter_by_shop(super().get_queryset())
