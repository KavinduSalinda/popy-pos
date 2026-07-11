"""Catalog API tests (categories and products)."""

import pytest

from apps.catalog.models import Category, Product

from .conftest import authed_client


@pytest.mark.django_db
class TestCatalogAPI:
    def test_manager_can_create_category(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.post(
            "/api/categories",
            {"name": "Snacks", "description": "Packaged food"},
            format="json",
        )

        assert response.status_code == 201
        assert response.data["name"] == "Snacks"
        assert Category.objects.filter(shop=shop_a, name="Snacks").exists()

    def test_manager_can_create_product(self, manager_a, shop_a, category_a):
        client = authed_client(manager_a, shop_a)

        response = client.post(
            "/api/products",
            {
                "name": "Potato Chips",
                "sku": "SNK-001",
                "barcode": "899999000002",
                "categoryId": category_a.id,
                "unit": "pack",
                "costPrice": "1.20",
                "sellingPrice": "2.50",
                "reorderLevel": 10,
                "status": True,
            },
            format="json",
        )

        assert response.status_code == 201
        assert response.data["sku"] == "SNK-001"
        assert Product.objects.filter(shop=shop_a, sku="SNK-001").exists()

    def test_manager_can_list_products_for_shop(self, manager_a, shop_a, product_a):
        client = authed_client(manager_a, shop_a)

        response = client.get("/api/products")

        assert response.status_code == 200
        assert response.data["total"] >= 1
        skus = {item["sku"] for item in response.data["data"]}
        assert "TEA-TEST" in skus

    def test_cashier_cannot_create_product(self, cashier_a, shop_a, category_a):
        client = authed_client(cashier_a, shop_a)

        response = client.post(
            "/api/products",
            {
                "name": "Blocked Product",
                "sku": "BLK-001",
                "categoryId": category_a.id,
                "unit": "ea",
                "costPrice": "1.00",
                "sellingPrice": "2.00",
                "reorderLevel": 1,
                "status": True,
            },
            format="json",
        )

        assert response.status_code == 403
