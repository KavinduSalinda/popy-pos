# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_settings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="notificationsettings",
            name="pos_checkout_cashier_email_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="notificationsettings",
            name="pos_checkout_cashier_sms_enabled",
            field=models.BooleanField(default=False),
        ),
    ]
