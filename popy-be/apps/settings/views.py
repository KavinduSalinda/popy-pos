from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.choices import ShopPlan
from apps.core.permissions import HasPOSPermission, role_has_permission
from apps.core.shop_context import ShopScopedMixin
from apps.core.utils import dict_to_camel_case
from apps.settings.models import NotificationSettings
from apps.settings.serializers import NotificationSettingsSerializer


def pro_required_response():
    return Response(
        {
            "message": "Notification settings are available on the Pro plan only.",
            "statusCode": 403,
            "code": "PRO_PLAN_REQUIRED",
        },
        status=status.HTTP_403_FORBIDDEN,
    )


class NotificationSettingsView(ShopScopedMixin, APIView):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "SETTINGS_MANAGE"

    def get(self, request):
        # Free shops can still view the page; saving is Pro-only.
        settings = NotificationSettings.load(self.shop)
        payload = NotificationSettingsSerializer(settings).data
        payload["isProFeature"] = True
        payload["proEnabled"] = self.shop.plan == ShopPlan.PRO
        return Response(payload)

    def patch(self, request):
        if self.shop.plan != ShopPlan.PRO:
            return pro_required_response()
        settings = NotificationSettings.load(self.shop)
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class PosCheckoutNotificationOptionsView(ShopScopedMixin, APIView):
    """Checkout notification options for the current POS user."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "POS_ACCESS"

    def get(self, request):
        settings = NotificationSettings.load(self.shop)
        user = request.user
        pro = self.shop.plan == ShopPlan.PRO
        data = {
            "email_enabled": pro and settings.pos_checkout_email_enabled,
            "sms_enabled": pro and settings.pos_checkout_sms_enabled,
            "cashier_email_enabled": pro and settings.pos_checkout_cashier_email_enabled,
            "cashier_sms_enabled": pro and settings.pos_checkout_cashier_sms_enabled,
            "can_send_email": (
                pro
                and settings.pos_checkout_email_enabled
                and settings.pos_checkout_cashier_email_enabled
                and role_has_permission(user.role, "POS_CHECKOUT_SEND_EMAIL")
            ),
            "can_send_sms": (
                pro
                and settings.pos_checkout_sms_enabled
                and settings.pos_checkout_cashier_sms_enabled
                and role_has_permission(user.role, "POS_CHECKOUT_SEND_SMS")
            ),
            "pro_enabled": pro,
        }
        return Response(dict_to_camel_case(data))
