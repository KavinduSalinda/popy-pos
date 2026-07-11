from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("sales", "0002_multishop"),
    ]

    operations = [
        migrations.AddField(
            model_name="sale",
            name="client_id",
            field=models.CharField(blank=True, db_index=True, max_length=36, null=True),
        ),
        migrations.AddConstraint(
            model_name="sale",
            constraint=models.UniqueConstraint(
                condition=models.Q(("client_id__isnull", False)),
                fields=("shop", "client_id"),
                name="uniq_sale_shop_client_id",
            ),
        ),
    ]
