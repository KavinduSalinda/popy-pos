from apps.core.serializers import CamelCaseModelSerializer
from apps.settings.models import NotificationSettings


class NotificationSettingsSerializer(CamelCaseModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = [
            "id",
            "pos_checkout_email_enabled",
            "pos_checkout_sms_enabled",
            "pos_checkout_cashier_email_enabled",
            "pos_checkout_cashier_sms_enabled",
            "low_inventory_email_enabled",
            "low_inventory_sms_enabled",
            "low_inventory_alert_phone",
            "new_customer_email_enabled",
            "new_customer_sms_enabled",
            "new_user_email_enabled",
            "new_user_sms_enabled",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]
