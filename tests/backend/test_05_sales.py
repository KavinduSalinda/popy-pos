"""Sales / POS API tests."""

import pytest

from apps.catalog.models import Product
from apps.sales.models import Sale

from .conftest import authed_client


@pytest.mark.django_db
class TestSalesAPI:
    def test_cashier_can_create_sale_and_reduce_stock(
        self, cashier_a, shop_a, product_a, customer_a
    ):
        client = authed_client(cashier_a, shop_a)
        initial_stock = product_a.stock_quantity

        response = client.post(
            "/api/sales",
            {
                "customerId": customer_a.id,
                "items": [
                    {
                        "productId": product_a.id,
                        "quantity": 2,
                        "unitPrice": "5.50",
                    }
                ],
                "discount": "0.00",
                "tax": "0.00",
                "paymentMethod": "CASH",
                "amountPaid": "11.00",
            },
            format="json",
        )

        assert response.status_code == 201
        assert response.data["total"] == "11.00"
        assert Sale.objects.filter(shop=shop_a).count() == 1

        product_a.refresh_from_db()
        assert product_a.stock_quantity == initial_stock - 2

    def test_sale_fails_when_stock_insufficient(self, cashier_a, shop_a, product_a):
        client = authed_client(cashier_a, shop_a)

        response = client.post(
            "/api/sales",
            {
                "items": [
                    {
                        "productId": product_a.id,
                        "quantity": 999,
                        "unitPrice": "5.50",
                    }
                ],
                "paymentMethod": "CASH",
                "amountPaid": "5000.00",
            },
            format="json",
        )

        assert response.status_code == 409

    def test_pos_product_lookup(self, cashier_a, shop_a, product_a):
        client = authed_client(cashier_a, shop_a)

        response = client.get(
            "/api/pos/products/lookup",
            {"code": product_a.barcode},
        )

        assert response.status_code == 200
        assert response.data["sku"] == product_a.sku

    def test_pos_checkout_notification_options(self, cashier_a, shop_a):
        client = authed_client(cashier_a, shop_a)

        response = client.get("/api/settings/pos-checkout-notifications")

        assert response.status_code == 200
        assert "canSendEmail" in response.data
        assert "canSendSms" in response.data
