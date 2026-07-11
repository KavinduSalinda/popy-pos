import django.db.models.deletion
from django.db import migrations, models

from apps.shops.multishop_helpers import backfill_model_shop, ensure_default_shop


def forwards(apps, schema_editor):
    shop_id = ensure_default_shop(apps)
    backfill_model_shop(apps, "catalog", "Category", shop_id)
    backfill_model_shop(apps, "catalog", "Product", shop_id)


class Migration(migrations.Migration):

    dependencies = [
        ("shops", "0001_initial"),
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="categories",
                to="shops.shop",
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="shop",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="products",
                to="shops.shop",
            ),
        ),
        migrations.AlterField(
            model_name="category",
            name="name",
            field=models.CharField(max_length=80),
        ),
        migrations.AlterField(
            model_name="product",
            name="sku",
            field=models.CharField(db_index=True, max_length=60),
        ),
        migrations.AlterField(
            model_name="product",
            name="barcode",
            field=models.CharField(blank=True, db_index=True, max_length=60, null=True),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="category",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="categories",
                to="shops.shop",
            ),
        ),
        migrations.AlterField(
            model_name="product",
            name="shop",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="products",
                to="shops.shop",
            ),
        ),
        migrations.AddConstraint(
            model_name="category",
            constraint=models.UniqueConstraint(fields=("shop", "name"), name="uniq_category_shop_name"),
        ),
        migrations.AddConstraint(
            model_name="product",
            constraint=models.UniqueConstraint(fields=("shop", "sku"), name="uniq_product_shop_sku"),
        ),
        migrations.AddConstraint(
            model_name="product",
            constraint=models.UniqueConstraint(
                condition=models.Q(("barcode__isnull", False)),
                fields=("shop", "barcode"),
                name="uniq_product_shop_barcode",
            ),
        ),
        migrations.RemoveIndex(
            model_name="product",
            name="catalog_pro_name_f603c0_idx",
        ),
        migrations.RemoveIndex(
            model_name="product",
            name="catalog_pro_categor_7c1c1f_idx",
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["shop", "name"], name="catalog_pro_shop_name_idx"),
        ),
        migrations.AddIndex(
            model_name="product",
            index=models.Index(fields=["shop", "category"], name="catalog_pro_shop_cat_idx"),
        ),
    ]
