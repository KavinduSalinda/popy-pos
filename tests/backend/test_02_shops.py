"""Shop and multi-shop context tests."""

import pytest

from apps.shops.models import Shop

from .conftest import authed_client


@pytest.mark.django_db
class TestShopsAPI:
    def test_accessible_shops_for_manager_returns_assigned_shop(self, manager_a, shop_a):
        client = authed_client(manager_a)

        response = client.get("/api/shops/accessible")

        assert response.status_code == 200
        assert len(response.data["shops"]) == 1
        assert response.data["shops"][0]["code"] == "TSTA"
        assert response.data["defaultShopId"] == shop_a.id

    def test_accessible_shops_for_super_admin_returns_all_active(self, super_admin, shop_a, shop_b):
        client = authed_client(super_admin)

        response = client.get("/api/shops/accessible")

        assert response.status_code == 200
        codes = {shop["code"] for shop in response.data["shops"]}
        assert {"TSTA", "TSTB"}.issubset(codes)

    def test_manager_cannot_list_shops_admin_endpoint(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.get("/api/shops")

        assert response.status_code == 403

    def test_super_admin_can_create_shop(self, super_admin, shop_a):
        client = authed_client(super_admin, shop_a)

        response = client.post(
            "/api/shops",
            {"name": "Branch C", "code": "TSTC", "isActive": True},
            format="json",
        )

        assert response.status_code == 201
        assert Shop.objects.filter(code="TSTC").exists()

    def test_api_requires_shop_header_when_user_has_no_assigned_shop(self, super_admin):
        client = authed_client(super_admin)

        response = client.get("/api/products")

        assert response.status_code == 400
