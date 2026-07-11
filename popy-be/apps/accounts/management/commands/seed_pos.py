from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.catalog.models import Category, Product
from apps.core.choices import Role
from apps.parties.models import Customer, Supplier
from apps.settings.models import NotificationSettings
from apps.shops.models import Shop


class Command(BaseCommand):
    help = "Seed POS database with sample data and dev admin user"

    def handle(self, *args, **options):
        shop, _ = Shop.objects.get_or_create(
            code="MAIN",
            defaults={
                "name": "Main Shop",
                "address": "123 Main Street",
                "phone": "0112345678",
            },
        )
        NotificationSettings.load(shop)

        user, created = User.objects.get_or_create(
            email="admin@test.com",
            defaults={
                "name": "Admin User",
                "role": Role.SUPER_ADMIN,
                "shop": shop,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            user.set_password("123456")
            user.save()
            self.stdout.write(self.style.SUCCESS("Created admin@test.com / 123456"))
        else:
            user.set_password("123456")
            user.role = Role.SUPER_ADMIN
            user.shop = shop
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write("Reset password for admin@test.com")

        categories_data = [
            ("Beverages", "Hot and cold drinks"),
            ("Snacks", "Packaged snacks"),
            ("Grocery", "Daily essentials"),
        ]
        categories = {}
        for name, description in categories_data:
            cat, _ = Category.objects.get_or_create(
                shop=shop,
                name=name,
                defaults={"description": description},
            )
            categories[name] = cat

        products_data = [
            ("Coffee Beans", "COF-001", "8901234567890", "Beverages", "kg", 8.5, 12.0, 10, 45),
            ("Green Tea", "TEA-001", "8901234567891", "Beverages", "box", 3.0, 5.5, 15, 30),
            ("Potato Chips", "SNK-001", "8901234567892", "Snacks", "pack", 1.2, 2.5, 20, 8),
            ("Mineral Water", "BEV-001", "8901234567893", "Beverages", "bottle", 0.5, 1.0, 50, 100),
            ("Rice 5kg", "GRC-001", "8901234567894", "Grocery", "bag", 4.0, 6.5, 5, 3),
        ]
        for name, sku, barcode, cat_name, unit, cost, sell, reorder, stock in products_data:
            Product.objects.update_or_create(
                shop=shop,
                sku=sku,
                defaults={
                    "name": name,
                    "barcode": barcode,
                    "category": categories[cat_name],
                    "brand": "House",
                    "unit": unit,
                    "cost_price": Decimal(str(cost)),
                    "selling_price": Decimal(str(sell)),
                    "reorder_level": reorder,
                    "stock_quantity": stock,
                    "status": True,
                },
            )

        customers = [
            ("Walk-in Customer", "0000000000", None),
            ("Jane Doe", "9876543210", "jane@example.com"),
            ("John Smith", "9876543211", "john@example.com"),
        ]
        for name, phone, email in customers:
            Customer.objects.get_or_create(shop=shop, phone=phone, defaults={"name": name, "email": email})

        suppliers = [
            ("Acme Supplies", "Acme Co", "1111111111", "acme@example.com"),
            ("Fresh Foods Ltd", "Fresh Foods", "2222222222", "fresh@example.com"),
        ]
        for name, company, phone, email in suppliers:
            Supplier.objects.get_or_create(
                shop=shop,
                phone=phone,
                defaults={"name": name, "company_name": company, "email": email},
            )

        self.stdout.write(self.style.SUCCESS(f"Seed data loaded for shop '{shop.name}' ({shop.code})."))
