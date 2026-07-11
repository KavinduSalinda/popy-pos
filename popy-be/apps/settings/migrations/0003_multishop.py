import django.db.models.deletion
from django.db import migrations, models

from apps.shops.multishop_helpers import ensure_default_shop


def forwards(apps, schema_editor):
    shop_id = ensure_default_shop(apps)
    NotificationSettings = apps.get_model("app_settings", "NotificationSettings")
    Shop = apps.get_model("shops", "Shop")
    shop = Shop.objects.get(pk=shop_id)

    settings = NotificationSettings.objects.first()
    if settings:
        settings.shop = shop
        settings.save(update_fields=["shop"])
    else:
        NotificationSettings.objects.create(shop=shop)


class Migration(migrations.Migration):

    dependencies = [
        ("shops", "0001_initial"),
        ("app_settings", "0002_notificationsettings_pos_checkout_cashier"),
    ]

    operations = [
        migrations.AddField(
            model_name="notificationsettings",
            name="shop",
            field=models.OneToOneField(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="notification_settings",
                to="shops.shop",
            ),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="notificationsettings",
            name="shop",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="notification_settings",
                to="shops.shop",
            ),
        ),
    ]
