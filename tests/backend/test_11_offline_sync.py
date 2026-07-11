"""Offline sync API tests."""

import uuid

import pytest

from apps.sales.models import Sale

from .conftest import authed_client


@pytest.mark.django_db
class TestOfflineSyncAPI:
    def test_bootstrap_returns_pos_bundle(
        self, cashier_a, shop_a, product_a, customer_a
    ):
        client = authed_client(cashier_a, shop_a)

        response = client.get("/api/sync/bootstrap")

        assert response.status_code == 200
        assert "products" in response.data
        assert "customers" in response.data
        assert "checkoutSettings" in response.data
        assert any(item["sku"] == product_a.sku for item in response.data["products"])
        assert any(item["id"] == customer_a.id for item in response.data["customers"])

    def test_sync_status_returns_counts(self, cashier_a, shop_a, product_a, customer_a):
        client = authed_client(cashier_a, shop_a)

        response = client.get("/api/sync/status")

        assert response.status_code == 200
        assert response.data["productCount"] >= 1
        assert response.data["customerCount"] >= 1

    def test_batch_sale_sync_is_idempotent(self, cashier_a, shop_a, product_a):
        client = authed_client(cashier_a, shop_a)
        client_id = str(uuid.uuid4())
        payload = {
            "sales": [
                {
                    "clientId": client_id,
                    "payload": {
                        "clientId": client_id,
                        "items": [
                            {
                                "productId": product_a.id,
                                "quantity": 1,
                                "unitPrice": "5.50",
                            }
                        ],
                        "discount": "0.00",
                        "tax": "0.00",
                        "paymentMethod": "CASH",
                        "amountPaid": "5.50",
                    },
                }
            ]
        }

        first = client.post("/api/sync/sales", payload, format="json")
        second = client.post("/api/sync/sales", payload, format="json")

        assert first.status_code == 200
        assert second.status_code == 200
        assert first.data["results"][0]["status"] == "synced"
        assert second.data["results"][0]["status"] == "duplicate"
        assert Sale.objects.filter(shop=shop_a, client_id=client_id).count() == 1

    def test_batch_sale_sync_rejects_insufficient_stock(
        self, cashier_a, shop_a, product_a
    ):
        client = authed_client(cashier_a, shop_a)
        client_id = str(uuid.uuid4())
        payload = {
            "sales": [
                {
                    "clientId": client_id,
                    "payload": {
                        "clientId": client_id,
                        "items": [
                            {
                                "productId": product_a.id,
                                "quantity": 9999,
                                "unitPrice": "5.50",
                            }
                        ],
                        "paymentMethod": "CASH",
                        "amountPaid": "50000.00",
                    },
                }
            ]
        }

        response = client.post("/api/sync/sales", payload, format="json")

        assert response.status_code == 200
        assert response.data["results"][0]["status"] == "rejected"
        assert Sale.objects.filter(shop=shop_a, client_id=client_id).count() == 0

    def test_catalog_sync_since_filter(self, cashier_a, shop_a, product_a):
        client = authed_client(cashier_a, shop_a)

        response = client.get(
            "/api/sync/catalog",
            {"since": "2099-01-01T00:00:00Z"},
        )

        assert response.status_code == 200
        assert response.data["products"] == []
