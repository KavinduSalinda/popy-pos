from apps.core.serializers import CamelCaseModelSerializer
from apps.shops.models import Shop


class ShopSerializer(CamelCaseModelSerializer):
    class Meta:
        model = Shop
        fields = [
            "id",
            "name",
            "code",
            "address",
            "phone",
            "email",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
