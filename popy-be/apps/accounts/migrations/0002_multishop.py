import django.db.models.deletion
from django.db import migrations, models

from apps.shops.multishop_helpers import backfill_model_shop, ensure_default_shop


def forwards(apps, schema_editor):
    shop_id = ensure_default_shop(apps)
    backfill_model_shop(apps, "accounts", "User", shop_id)


class Migration(migrations.Migration):

    dependencies = [
        ("shops", "0001_initial"),
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="shop",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="users",
                to="shops.shop",
            ),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
