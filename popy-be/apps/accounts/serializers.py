from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.accounts.models import User
from apps.core.choices import Role
from apps.core.permissions import get_permissions_for_role
from apps.core.serializers import CamelCaseModelSerializer
from apps.core.shop_context import get_accessible_shops
from apps.core.utils import dict_to_camel_case
from apps.shops.serializers import ShopSerializer


class UserSerializer(CamelCaseModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=6)

    MANAGER_ASSIGNABLE_ROLES = {
        Role.MANAGER,
        Role.CASHIER,
        Role.INVENTORY_OFFICER,
    }

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "role",
            "shop_id",
            "is_active",
            "avatar_url",
            "password",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_read_only_fields(self):
        fields = list(super().get_read_only_fields())
        request = self.context.get("request")
        if request and request.user.role != Role.SUPER_ADMIN:
            fields.append("shop_id")
        return fields

    def validate_role(self, value):
        request = self.context.get("request")
        if request and request.user.role == Role.MANAGER:
            if value == Role.SUPER_ADMIN:
                raise ValidationError("Managers cannot assign the Super Admin role.")
            if value not in self.MANAGER_ASSIGNABLE_ROLES:
                raise ValidationError("Managers can only assign shop staff roles.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.role == Role.MANAGER:
            instance = getattr(self, "instance", None)
            if instance and instance.role == Role.SUPER_ADMIN:
                raise PermissionDenied("Managers cannot modify Super Admin accounts.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        shop = self.context.get("shop")
        request = self.context.get("request")
        if request and request.user.role != Role.SUPER_ADMIN:
            validated_data.pop("shop_id", None)
        if shop and validated_data.get("role") != Role.SUPER_ADMIN:
            validated_data["shop"] = shop
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        request = self.context.get("request")
        if request and request.user.role != Role.SUPER_ADMIN:
            validated_data.pop("shop_id", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


def serialize_auth_user(user: User) -> dict:
    shops = get_accessible_shops(user)
    shops_data = ShopSerializer(shops, many=True).data
    default_shop_id = user.shop_id or (shops.first().id if shops.exists() else None)

    data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "permissions": get_permissions_for_role(user.role),
        "avatar_url": user.avatar_url,
        "is_active": user.is_active,
        "shop_id": user.shop_id,
        "default_shop_id": default_shop_id,
        "shops": shops_data,
    }
    return dict_to_camel_case(data)
