"""Authentication API tests."""

import pytest
from rest_framework.test import APIClient

from .conftest import authed_client, login


@pytest.mark.django_db
class TestAuthAPI:
    def test_login_success_returns_tokens_and_user(self, api_client, manager_a):
        data = login(api_client, "manager@test.com", "testpass123")

        assert "accessToken" in data
        assert "refreshToken" in data
        assert data["user"]["email"] == "manager@test.com"
        assert data["user"]["role"] == "MANAGER"
        assert "permissions" in data["user"]
        assert "shops" in data["user"]

    def test_login_invalid_password_returns_401(self, api_client, manager_a):
        response = api_client.post(
            "/api/auth/login",
            {"email": "manager@test.com", "password": "wrong"},
            format="json",
        )

        assert response.status_code == 401

    def test_login_missing_fields_returns_400(self, api_client):
        response = api_client.post("/api/auth/login", {"email": "x@test.com"}, format="json")

        assert response.status_code == 400

    def test_refresh_token_returns_new_tokens(self, api_client, manager_a):
        login_data = login(api_client, "manager@test.com", "testpass123")

        response = api_client.post(
            "/api/auth/refresh",
            {"refreshToken": login_data["refreshToken"]},
            format="json",
        )

        assert response.status_code == 200
        assert "accessToken" in response.data
        assert "refreshToken" in response.data
        assert response.data["user"]["email"] == "manager@test.com"

    def test_logout_returns_204(self, api_client, manager_a):
        login_data = login(api_client, "manager@test.com", "testpass123")
        client = authed_client(manager_a)

        response = client.post(
            "/api/auth/logout",
            {"refreshToken": login_data["refreshToken"]},
            format="json",
        )

        assert response.status_code == 204

    def test_protected_endpoint_requires_auth(self, api_client, shop_a):
        response = api_client.get(
            "/api/products",
            HTTP_X_SHOP_ID=str(shop_a.id),
        )

        assert response.status_code == 401
