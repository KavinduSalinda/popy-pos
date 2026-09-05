"""Live end-to-end return process against a running API.

Requires:
  POPY_API_URL=http://localhost:8000 (default)
  Seed user admin@test.com / 123456 (or override POPY_SMOKE_EMAIL / POPY_SMOKE_PASSWORD)

  pytest backend/test_13_returns_live.py -m smoke -q
"""

from __future__ import annotations

import os
from decimal import Decimal

import pytest
import requests

API_URL = os.environ.get("POPY_API_URL", "http://localhost:8000").rstrip("/")
EMAIL = os.environ.get("POPY_SMOKE_EMAIL", "admin@test.com")
PASSWORD = os.environ.get("POPY_SMOKE_PASSWORD", "123456")


def _server_available() -> bool:
    try:
        response = requests.get(f"{API_URL}/admin/login/", timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False


pytestmark = pytest.mark.smoke


def _login() -> tuple[str, int]:
    response = requests.post(
        f"{API_URL}/api/auth/login",
        json={"email": EMAIL, "password": PASSWORD},
        timeout=10,
    )
    assert response.status_code == 200, response.text
    data = response.json()
    token = data.get("accessToken") or data.get("access")
    user = data.get("user") or {}
    shops = user.get("shops") or []
    shop_id = user.get("shopId") or (shops[0]["id"] if shops else None)
    assert token and shop_id, data
    return token, int(shop_id)


def _headers(token: str, shop_id: int) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "X-Shop-Id": str(shop_id),
        "Content-Type": "application/json",
    }


@pytest.mark.skipif(not _server_available(), reason="API server is not running")
class TestLiveSalesReturnProcess:
    def test_sale_then_full_return_restores_stock(self):
        token, shop_id = _login()
        headers = _headers(token, shop_id)

        products = requests.get(
            f"{API_URL}/api/pos/products",
            headers=headers,
            params={"pageSize": 5},
            timeout=15,
        )
        assert products.status_code == 200, products.text
        body = products.json()
        if isinstance(body, list):
            rows = body
        else:
            rows = body.get("results") or body.get("data") or []
        assert isinstance(rows, list) and rows, body
        product = next((p for p in rows if Decimal(str(p.get("stockQuantity", 0))) >= 2), None)
        assert product is not None, "Need a product with stock >= 2 for live return test"
        product_id = product["id"]
        unit_price = str(product.get("sellingPrice") or product.get("price") or "1.00")
        stock_before = Decimal(str(product["stockQuantity"]))

        sale_resp = requests.post(
            f"{API_URL}/api/sales",
            headers=headers,
            json={
                "items": [
                    {
                        "productId": product_id,
                        "quantity": 2,
                        "unitPrice": unit_price,
                    }
                ],
                "discount": "0.00",
                "tax": "0.00",
                "paymentMethod": "CASH",
                "amountPaid": str(Decimal(unit_price) * 2),
            },
            timeout=15,
        )
        assert sale_resp.status_code == 201, sale_resp.text
        sale = sale_resp.json()
        sale_id = sale["id"]
        refund = sale["total"]

        after_sale = requests.get(
            f"{API_URL}/api/products/{product_id}",
            headers=headers,
            timeout=15,
        )
        assert after_sale.status_code == 200, after_sale.text
        stock_after_sale = Decimal(str(after_sale.json()["stockQuantity"]))
        assert stock_after_sale == stock_before - 2

        ret = requests.post(
            f"{API_URL}/api/returns/sales",
            headers=headers,
            json={
                "saleId": sale_id,
                "reason": "Live E2E return test",
                "refundAmount": refund,
                "items": [],
            },
            timeout=15,
        )
        assert ret.status_code == 201, ret.text
        ret_body = ret.json()
        assert ret_body["type"] == "SALES"
        assert ret_body["saleId"] == sale_id
        assert str(ret_body["reference"]).startswith("SR-")

        after_return = requests.get(
            f"{API_URL}/api/products/{product_id}",
            headers=headers,
            timeout=15,
        )
        assert after_return.status_code == 200, after_return.text
        stock_after_return = Decimal(str(after_return.json()["stockQuantity"]))
        assert stock_after_return == stock_before

        listed = requests.get(f"{API_URL}/api/returns", headers=headers, timeout=15)
        assert listed.status_code == 200, listed.text
        assert any(r.get("id") == ret_body["id"] for r in listed.json())
