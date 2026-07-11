"""Customer and supplier API tests."""

import pytest

from apps.parties.models import Customer, Supplier

from .conftest import authed_client


@pytest.mark.django_db
class TestPartiesAPI:
    def test_manager_can_create_customer(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.post(
            "/api/customers",
            {
                "name": "John Smith",
                "phone": "0779876543",
                "email": "john@example.com",
            },
            format="json",
        )

        assert response.status_code == 201
        assert Customer.objects.filter(shop=shop_a, phone="0779876543").exists()

    def test_manager_can_create_supplier(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.post(
            "/api/suppliers",
            {
                "name": "Acme Supplies",
                "companyName": "Acme Co",
                "phone": "0112223334",
                "email": "acme@example.com",
            },
            format="json",
        )

        assert response.status_code == 201
        assert Supplier.objects.filter(shop=shop_a, phone="0112223334").exists()

    def test_cashier_can_create_customer(self, cashier_a, shop_a):
        client = authed_client(cashier_a, shop_a)

        response = client.post(
            "/api/customers",
            {"name": "Walk-in", "phone": "0700000001"},
            format="json",
        )

        assert response.status_code == 201
