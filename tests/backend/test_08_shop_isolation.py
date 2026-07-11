"""Multi-shop data isolation tests."""

from decimal import Decimal

import pytest

from apps.catalog.models import Category, Product

from .conftest import authed_client


@pytest.mark.django_db
class TestShopIsolation:
    def test_products_are_isolated_between_shops(self, manager_a, shop_a, shop_b):
        category_b = Category.objects.create(shop=shop_b, name="Grocery")
        Product.objects.create(
            shop=shop_b,
            category=category_b,
            name="Rice 5kg",
            sku="RICE-B",
            unit="bag",
            cost_price=Decimal("4.00"),
            selling_price=Decimal("6.50"),
            stock_quantity=10,
        )

        client = authed_client(manager_a, shop_a)
        response = client.get("/api/products")

        assert response.status_code == 200
        skus = {item["sku"] for item in response.data["data"]}
        assert "RICE-B" not in skus

    def test_super_admin_sees_shop_b_data_when_header_switched(
        self, super_admin, shop_a, shop_b, category_a, product_a
    ):
        category_b = Category.objects.create(shop=shop_b, name="Bakery")
        Product.objects.create(
            shop=shop_b,
            category=category_b,
            name="Croissant",
            sku="CRS-B",
            unit="ea",
            cost_price=Decimal("1.00"),
            selling_price=Decimal("2.50"),
            stock_quantity=5,
        )

        client_a = authed_client(super_admin, shop_a)
        client_b = authed_client(super_admin, shop_b)

        res_a = client_a.get("/api/products")
        res_b = client_b.get("/api/products")

        skus_a = {item["sku"] for item in res_a.data["data"]}
        skus_b = {item["sku"] for item in res_b.data["data"]}

        assert "TEA-TEST" in skus_a
        assert "CRS-B" not in skus_a
        assert "CRS-B" in skus_b
        assert "TEA-TEST" not in skus_b

    def test_same_sku_allowed_in_different_shops(self, shop_a, shop_b, category_a):
        category_b = Category.objects.create(shop=shop_b, name="Drinks")
        Product.objects.create(
            shop=shop_a,
            category=category_a,
            name="Tea A",
            sku="SHARED-SKU",
            unit="box",
            cost_price=Decimal("1.00"),
            selling_price=Decimal("2.00"),
            stock_quantity=1,
        )
        Product.objects.create(
            shop=shop_b,
            category=category_b,
            name="Tea B",
            sku="SHARED-SKU",
            unit="box",
            cost_price=Decimal("1.00"),
            selling_price=Decimal("2.00"),
            stock_quantity=1,
        )

        assert Product.objects.filter(sku="SHARED-SKU").count() == 2

    def test_manager_cannot_access_other_shop_via_header(self, manager_a, shop_a, shop_b):
        client = authed_client(manager_a, shop_b)

        response = client.get("/api/products")

        assert response.status_code == 403
