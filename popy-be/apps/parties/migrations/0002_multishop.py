import django.db.models.deletion
from django.db import migrations, models

from apps.shops.multishop_helpers import backfill_model_shop, ensure_default_shop


def forwards(apps, schema_editor):
    shop_id = ensure_default_shop(apps)
    backfill_model_shop(apps, "parties", "Customer", shop_id)
    backfill_model_shop(apps, "parties", "Supplier", shop_id)


class Migration(migrations.Migration):

    dependencies = [
        ("shops", "0001_initial"),
        ("parties", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customer",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="customers",
                to="shops.shop",
            ),
        ),
        migrations.AddField(
            model_name="supplier",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="suppliers",
                to="shops.shop",
            ),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="customer",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="customers",
                to="shops.shop",
            ),
        ),
        migrations.AlterField(
            model_name="supplier",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="suppliers",
                to="shops.shop",
            ),
        ),
        migrations.AddConstraint(
            model_name="customer",
            constraint=models.UniqueConstraint(fields=("shop", "phone"), name="uniq_customer_shop_phone"),
        ),
        migrations.AddConstraint(
            model_name="supplier",
            constraint=models.UniqueConstraint(fields=("shop", "phone"), name="uniq_supplier_shop_phone"),
        ),
    ]
