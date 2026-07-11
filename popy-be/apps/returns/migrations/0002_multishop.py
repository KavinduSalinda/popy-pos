import django.db.models.deletion
from django.db import migrations, models

from apps.shops.multishop_helpers import backfill_model_shop, ensure_default_shop


def forwards(apps, schema_editor):
    shop_id = ensure_default_shop(apps)
    backfill_model_shop(apps, "returns", "SalesReturn", shop_id)
    backfill_model_shop(apps, "returns", "PurchaseReturn", shop_id)


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0002_multishop"),
        ("purchasing", "0002_multishop"),
        ("returns", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="salesreturn",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sales_returns",
                to="shops.shop",
            ),
        ),
        migrations.AddField(
            model_name="purchasereturn",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="purchase_returns",
                to="shops.shop",
            ),
        ),
        migrations.AlterField(
            model_name="salesreturn",
            name="reference",
            field=models.CharField(max_length=32),
        ),
        migrations.AlterField(
            model_name="purchasereturn",
            name="reference",
            field=models.CharField(max_length=32),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="salesreturn",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sales_returns",
                to="shops.shop",
            ),
        ),
        migrations.AlterField(
            model_name="purchasereturn",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="purchase_returns",
                to="shops.shop",
            ),
        ),
        migrations.AddConstraint(
            model_name="salesreturn",
            constraint=models.UniqueConstraint(fields=("shop", "reference"), name="uniq_sales_return_shop_reference"),
        ),
        migrations.AddConstraint(
            model_name="purchasereturn",
            constraint=models.UniqueConstraint(fields=("shop", "reference"), name="uniq_purchase_return_shop_reference"),
        ),
    ]
