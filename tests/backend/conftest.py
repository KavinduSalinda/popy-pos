"""Shared fixtures and helpers for Popy POS API tests."""

from __future__ import annotations

from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.catalog.models import Category, Product
from apps.core.choices import Role
from apps.parties.models import Customer
from apps.settings.models import NotificationSettings
from apps.shops.models import Shop

User = get_user_model()


@pytest.fixture(scope="session")
def django_db_modify_db_settings():
    from pathlib import Path

    test_db = Path(__file__).resolve().parent.parent / ".test_db.sqlite3"
    if test_db.exists():
        test_db.unlink()

    return {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": str(test_db),
        }
    }


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def shop_a(db) -> Shop:
    shop = Shop.objects.create(name="Test Shop A", code="TSTA", phone="0111111111")
    NotificationSettings.load(shop)
    return shop


@pytest.fixture
def shop_b(db) -> Shop:
    shop = Shop.objects.create(name="Test Shop B", code="TSTB", phone="0222222222")
    NotificationSettings.load(shop)
    return shop


@pytest.fixture
def super_admin(db, shop_a) -> User:
    return User.objects.create_user(
        email="super@test.com",
        password="testpass123",
        name="Super Admin",
        role=Role.SUPER_ADMIN,
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def manager_a(db, shop_a) -> User:
    return User.objects.create_user(
        email="manager@test.com",
        password="testpass123",
        name="Shop Manager",
        role=Role.MANAGER,
        shop=shop_a,
    )


@pytest.fixture
def cashier_a(db, shop_a) -> User:
    return User.objects.create_user(
        email="cashier@test.com",
        password="testpass123",
        name="Shop Cashier",
        role=Role.CASHIER,
        shop=shop_a,
    )


@pytest.fixture
def category_a(db, shop_a) -> Category:
    return Category.objects.create(shop=shop_a, name="Beverages", description="Drinks")


@pytest.fixture
def product_a(db, shop_a, category_a) -> Product:
    return Product.objects.create(
        shop=shop_a,
        category=category_a,
        name="Green Tea",
        sku="TEA-TEST",
        barcode="899999000001",
        unit="box",
        cost_price=Decimal("3.00"),
        selling_price=Decimal("5.50"),
        reorder_level=5,
        stock_quantity=20,
        status=True,
    )


@pytest.fixture
def customer_a(db, shop_a) -> Customer:
    return Customer.objects.create(
        shop=shop_a,
        name="Jane Doe",
        phone="0771234567",
        email="jane@example.com",
    )


def issue_token(user: User) -> str:
    return str(RefreshToken.for_user(user).access_token)


def authed_client(user: User, shop: Shop | None = None) -> APIClient:
    client = APIClient()
    headers = {"HTTP_AUTHORIZATION": f"Bearer {issue_token(user)}"}
    if shop is not None:
        headers["HTTP_X_SHOP_ID"] = str(shop.id)
    client.credentials(**headers)
    return client


def login(client: APIClient, email: str, password: str) -> dict:
    response = client.post("/api/auth/login", {"email": email, "password": password}, format="json")
    assert response.status_code == 200, response.data
    return response.data
