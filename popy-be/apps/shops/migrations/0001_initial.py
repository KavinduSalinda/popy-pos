from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Shop",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120)),
                ("code", models.CharField(db_index=True, max_length=32, unique=True)),
                ("address", models.TextField(blank=True, default="")),
                ("phone", models.CharField(blank=True, default="", max_length=20)),
                ("email", models.EmailField(blank=True, default="", max_length=255)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
    ]
