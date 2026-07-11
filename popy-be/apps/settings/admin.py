from django.contrib import admin

from apps.settings.models import NotificationSettings


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = ("shop", "updated_at")
    list_filter = ("shop",)
