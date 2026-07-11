# Generated manually for NotificationSettings

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="NotificationSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("pos_checkout_email_enabled", models.BooleanField(default=True)),
                ("pos_checkout_sms_enabled", models.BooleanField(default=False)),
                ("low_inventory_email_enabled", models.BooleanField(default=True)),
                ("low_inventory_sms_enabled", models.BooleanField(default=False)),
                ("low_inventory_alert_phone", models.CharField(blank=True, default="", max_length=20)),
                ("new_customer_email_enabled", models.BooleanField(default=True)),
                ("new_customer_sms_enabled", models.BooleanField(default=False)),
                ("new_user_email_enabled", models.BooleanField(default=True)),
                ("new_user_sms_enabled", models.BooleanField(default=False)),
            ],
            options={
                "verbose_name": "notification settings",
                "verbose_name_plural": "notification settings",
            },
        ),
    ]
