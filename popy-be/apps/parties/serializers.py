from apps.core.serializers import CamelCaseModelSerializer
from apps.parties.models import Customer, Supplier


class CustomerSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "address",
            "loyalty_points",
            "created_at",
            "updated_at",
        ]


class SupplierSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "company_name",
            "phone",
            "email",
            "address",
            "created_at",
            "updated_at",
        ]
