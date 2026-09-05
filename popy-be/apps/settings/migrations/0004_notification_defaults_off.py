# Generated manually — notification settings default off (Pro feature)

from django.db import migrations, models


def turn_off_all_notifications(apps, schema_editor):
    NotificationSettings = apps.get_model("app_settings", "NotificationSettings")
    NotificationSettings.objects.all().update(
        pos_checkout_email_enabled=False,
        pos_checkout_sms_enabled=False,
        pos_checkout_cashier_email_enabled=False,
        pos_checkout_cashier_sms_enabled=False,
        low_inventory_email_enabled=False,
        low_inventory_sms_enabled=False,
        new_customer_email_enabled=False,
        new_customer_sms_enabled=False,
        new_user_email_enabled=False,
        new_user_sms_enabled=False,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("app_settings", "0003_multishop"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notificationsettings",
            name="pos_checkout_email_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="pos_checkout_sms_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="pos_checkout_cashier_email_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="pos_checkout_cashier_sms_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="low_inventory_email_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="low_inventory_sms_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="new_customer_email_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="new_customer_sms_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="new_user_email_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="notificationsettings",
            name="new_user_sms_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(turn_off_all_notifications, migrations.RunPython.noop),
    ]
