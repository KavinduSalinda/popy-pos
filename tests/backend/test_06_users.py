"""User management API tests."""

import pytest

from apps.accounts.models import User
from apps.core.choices import Role

from .conftest import authed_client


@pytest.mark.django_db
class TestUsersAPI:
    def test_manager_can_list_shop_users(self, manager_a, shop_a, cashier_a):
        client = authed_client(manager_a, shop_a)

        response = client.get("/api/users")

        assert response.status_code == 200
        emails = {user["email"] for user in response.data["data"]}
        assert "cashier@test.com" in emails
        assert "manager@test.com" in emails

    def test_manager_can_create_cashier(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.post(
            "/api/users",
            {
                "name": "New Cashier",
                "email": "newcashier@test.com",
                "role": Role.CASHIER,
                "password": "secret12",
                "isActive": True,
            },
            format="json",
        )

        assert response.status_code == 201
        user = User.objects.get(email="newcashier@test.com")
        assert user.shop_id == shop_a.id
        assert user.role == Role.CASHIER

    def test_manager_cannot_create_super_admin(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.post(
            "/api/users",
            {
                "name": "Bad Admin",
                "email": "badadmin@test.com",
                "role": Role.SUPER_ADMIN,
                "password": "secret12",
                "isActive": True,
            },
            format="json",
        )

        assert response.status_code == 400

    def test_cashier_cannot_manage_users(self, cashier_a, shop_a):
        client = authed_client(cashier_a, shop_a)

        response = client.get("/api/users")

        assert response.status_code == 403

    def test_manager_cannot_delete_self(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.delete(f"/api/users/{manager_a.id}")

        assert response.status_code == 400
