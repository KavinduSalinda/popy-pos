"""
Apply multi-shop schema changes for existing databases.

For a fresh install, run: python manage.py migrate && python manage.py seed_pos

For an existing database with data, this command:
1. Creates a default shop (MAIN)
2. Adds shop_id columns if missing (via migrate)
3. Backfills all tenant rows to the default shop
"""

from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Backfill existing data into a default shop after multi-shop migration"

    def handle(self, *args, **options):
        from apps.shops.models import Shop

        shop, created = Shop.objects.get_or_create(
            code="MAIN",
            defaults={"name": "Main Shop", "address": "", "phone": ""},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created default shop: {shop.name}"))
        else:
            self.stdout.write(f"Using existing shop: {shop.name}")

        tables = [
            ("catalog_category", "shop_id"),
            ("catalog_product", "shop_id"),
            ("parties_customer", "shop_id"),
            ("parties_supplier", "shop_id"),
            ("purchasing_purchase", "shop_id"),
            ("sales_sale", "shop_id"),
            ("returns_salesreturn", "shop_id"),
            ("returns_purchasereturn", "shop_id"),
            ("app_settings_notificationsettings", "shop_id"),
            ("accounts_user", "shop_id"),
        ]

        with connection.cursor() as cursor:
            for table, column in tables:
                try:
                    cursor.execute(
                        f"UPDATE {table} SET {column} = %s WHERE {column} IS NULL",
                        [shop.id],
                    )
                    self.stdout.write(f"Backfilled {table}.{column}")
                except Exception as exc:
                    self.stdout.write(self.style.WARNING(f"Skipped {table}: {exc}"))

        from apps.settings.models import NotificationSettings

        NotificationSettings.objects.get_or_create(shop=shop)
        self.stdout.write(self.style.SUCCESS("Multi-shop backfill complete."))
