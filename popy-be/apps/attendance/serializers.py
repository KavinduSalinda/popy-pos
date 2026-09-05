from rest_framework import serializers

from apps.attendance.models import Attendance
from apps.core.serializers import CamelCaseModelSerializer


class AttendanceSerializer(CamelCaseModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_role = serializers.CharField(source="user.role", read_only=True)
    shop_id = serializers.IntegerField(read_only=True)
    shop_name = serializers.CharField(source="shop.name", read_only=True)
    clocked_in = serializers.SerializerMethodField()
    clocked_out = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            "id",
            "user_id",
            "user_name",
            "user_email",
            "user_role",
            "shop_id",
            "shop_name",
            "attendance_date",
            "clock_in_at",
            "clock_out_at",
            "clocked_in",
            "clocked_out",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_clocked_in(self, obj: Attendance) -> bool:
        return obj.clock_in_at is not None

    def get_clocked_out(self, obj: Attendance) -> bool:
        return obj.clock_out_at is not None
