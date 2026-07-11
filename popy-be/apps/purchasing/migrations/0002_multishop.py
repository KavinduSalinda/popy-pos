import django.db.models.deletion
from django.db import migrations, models

from apps.shops.multishop_helpers import backfill_model_shop, ensure_default_shop


def forwards(apps, schema_editor):
    shop_id = ensure_default_shop(apps)
    backfill_model_shop(apps, "purchasing", "Purchase", shop_id)


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0002_multishop"),
        ("parties", "0002_multishop"),
        ("purchasing", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="purchase",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="purchases",
                to="shops.shop",
            ),
        ),
        migrations.AlterField(
            model_name="purchase",
            name="reference",
            field=models.CharField(max_length=32),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="purchase",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="purchases",
                to="shops.shop",
            ),
        ),
        migrations.AddConstraint(
            model_name="purchase",
            constraint=models.UniqueConstraint(fields=("shop", "reference"), name="uniq_purchase_shop_reference"),
        ),
    ]
