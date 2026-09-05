from django.contrib import admin

from apps.attendance.models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "shop", "attendance_date", "clock_in_at", "clock_out_at")
    list_filter = ("attendance_date", "shop")
    search_fields = ("user__email", "user__name", "shop__name")
    readonly_fields = ("created_at", "updated_at")
