"""Dashboard and reports API smoke tests."""

import pytest

from .conftest import authed_client


@pytest.mark.django_db
class TestDashboardAndReportsAPI:
    def test_manager_can_load_dashboard_summary(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.get("/api/dashboard/summary")

        assert response.status_code == 200
        assert isinstance(response.data, dict)

    def test_manager_can_load_sales_report(self, manager_a, shop_a):
        client = authed_client(manager_a, shop_a)

        response = client.get("/api/reports/sales")

        assert response.status_code == 200

    def test_manager_can_load_inventory_report(self, manager_a, shop_a, product_a):
        client = authed_client(manager_a, shop_a)

        response = client.get("/api/reports/inventory")

        assert response.status_code == 200

    def test_cashier_cannot_load_reports(self, cashier_a, shop_a):
        client = authed_client(cashier_a, shop_a)

        response = client.get("/api/reports/sales")

        assert response.status_code == 403
