"""Daily attendance API authorization and integrity tests."""

from __future__ import annotations

from datetime import date, timedelta

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.attendance.models import Attendance
from apps.core.choices import Role, ShopPlan
from apps.shops.models import Shop

from .conftest import authed_client

User = get_user_model()


@pytest.fixture
def pro_shop_a(shop_a):
    shop_a.plan = ShopPlan.PRO
    shop_a.save(update_fields=["plan"])
    return shop_a


@pytest.fixture
def pro_shop_b(shop_b):
    shop_b.plan = ShopPlan.PRO
    shop_b.save(update_fields=["plan"])
    return shop_b


@pytest.fixture
def inventory_officer_a(db, pro_shop_a):
    return User.objects.create_user(
        email="inventory@test.com",
        password="testpass123",
        name="Inventory Officer",
        role=Role.INVENTORY_OFFICER,
        shop=pro_shop_a,
    )


@pytest.fixture
def manager_b(db, pro_shop_b):
    return User.objects.create_user(
        email="manager_b@test.com",
        password="testpass123",
        name="Shop B Manager",
        role=Role.MANAGER,
        shop=pro_shop_b,
    )


@pytest.mark.django_db
class TestMarkAttendance:
    def test_manager_can_clock_in(self, manager_a, pro_shop_a):
        client = authed_client(manager_a, pro_shop_a)
        response = client.post("/api/attendance", {"type": "in"}, format="json")
        assert response.status_code == 201
        body = response.json()
        assert body["userId"] == manager_a.id
        assert body["shopId"] == pro_shop_a.id
        assert body["attendanceDate"] == timezone.localdate().isoformat()
        assert body["clockedIn"] is True
        assert body["clockedOut"] is False
        assert body["alreadyMarked"] is False

    def test_cashier_clock_in_then_out(self, cashier_a, pro_shop_a):
        client = authed_client(cashier_a, pro_shop_a)
        assert client.post("/api/attendance", {"type": "in"}, format="json").status_code == 201
        out = client.post("/api/attendance", {"type": "out"}, format="json")
        assert out.status_code == 200
        assert out.json()["clockedOut"] is True

    def test_inventory_officer_can_clock_in(self, inventory_officer_a, pro_shop_a):
        client = authed_client(inventory_officer_a, pro_shop_a)
        assert (
            client.post("/api/attendance", {"type": "in"}, format="json").status_code
            == 201
        )

    def test_super_admin_cannot_mark(self, super_admin, pro_shop_a):
        client = authed_client(super_admin, pro_shop_a)
        response = client.post("/api/attendance", {"type": "in"}, format="json")
        assert response.status_code == 403

    def test_free_plan_cannot_mark(self, cashier_a, shop_a):
        assert shop_a.plan == ShopPlan.FREE
        client = authed_client(cashier_a, shop_a)
        response = client.post("/api/attendance", {"type": "in"}, format="json")
        assert response.status_code == 403
        assert response.json()["code"] == "PRO_PLAN_REQUIRED"

    def test_unauthenticated_cannot_mark(self, api_client):
        assert api_client.post("/api/attendance", {"type": "in"}, format="json").status_code == 401

    def test_duplicate_clock_in_is_idempotent(self, cashier_a, pro_shop_a):
        client = authed_client(cashier_a, pro_shop_a)
        first = client.post("/api/attendance", {"type": "in"}, format="json")
        second = client.post("/api/attendance", {"type": "in"}, format="json")
        assert first.status_code == 201
        assert second.status_code == 200
        assert second.json()["alreadyMarked"] is True
        assert Attendance.objects.filter(user=cashier_a).count() == 1

    def test_clock_out_without_in_fails(self, cashier_a, pro_shop_a):
        client = authed_client(cashier_a, pro_shop_a)
        response = client.post("/api/attendance", {"type": "out"}, format="json")
        assert response.status_code == 400

    def test_ignores_client_user_and_shop_and_date_body(
        self, cashier_a, pro_shop_a, pro_shop_b, manager_b
    ):
        client = authed_client(cashier_a, pro_shop_b)
        response = client.post(
            "/api/attendance",
            {
                "type": "in",
                "userId": manager_b.id,
                "shopId": pro_shop_b.id,
                "attendanceDate": (date.today() - timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        assert response.status_code == 201
        record = Attendance.objects.get(user=cashier_a)
        assert record.shop_id == pro_shop_a.id
        assert record.attendance_date == timezone.localdate()
        assert record.user_id == cashier_a.id

    def test_cannot_create_for_arbitrary_date(self, cashier_a, pro_shop_a):
        client = authed_client(cashier_a, pro_shop_a)
        client.post(
            "/api/attendance",
            {"type": "in", "attendanceDate": "2020-01-01"},
            format="json",
        )
        record = Attendance.objects.get(user=cashier_a)
        assert record.attendance_date == timezone.localdate()
        assert record.attendance_date != date(2020, 1, 1)

    def test_unique_constraint_enforced(self, cashier_a, pro_shop_a):
        today = timezone.localdate()
        Attendance.objects.create(
            user=cashier_a,
            shop=pro_shop_a,
            attendance_date=today,
            clock_in_at=timezone.now(),
        )
        with pytest.raises(IntegrityError):
            with transaction.atomic():
                Attendance.objects.create(
                    user=cashier_a,
                    shop=pro_shop_a,
                    attendance_date=today,
                    clock_in_at=timezone.now(),
                )
        assert Attendance.objects.filter(user=cashier_a).count() == 1


@pytest.mark.django_db
class TestAttendanceToday:
    def test_today_status(self, cashier_a, pro_shop_a):
        client = authed_client(cashier_a, pro_shop_a)
        before = client.get("/api/attendance/today")
        assert before.status_code == 200
        assert before.json()["clockedIn"] is False
        client.post("/api/attendance", {"type": "in"}, format="json")
        after = client.get("/api/attendance/today")
        assert after.json()["clockedIn"] is True
        assert after.json()["clockedOut"] is False


@pytest.mark.django_db
class TestAttendanceList:
    def test_manager_sees_own_shop_only(
        self, manager_a, manager_b, cashier_a, pro_shop_a, pro_shop_b
    ):
        Attendance.objects.create(
            user=cashier_a,
            shop=pro_shop_a,
            attendance_date=timezone.localdate(),
            clock_in_at=timezone.now(),
        )
        Attendance.objects.create(
            user=manager_b,
            shop=pro_shop_b,
            attendance_date=timezone.localdate(),
            clock_in_at=timezone.now(),
        )
        client = authed_client(manager_a, pro_shop_a)
        response = client.get("/api/attendance/list")
        assert response.status_code == 200
        rows = response.json()["data"]
        assert len(rows) == 1
        assert rows[0]["shopId"] == pro_shop_a.id

    def test_manager_cannot_override_shop_filter(
        self, manager_a, manager_b, pro_shop_a, pro_shop_b
    ):
        Attendance.objects.create(
            user=manager_b,
            shop=pro_shop_b,
            attendance_date=timezone.localdate(),
            clock_in_at=timezone.now(),
        )
        client = authed_client(manager_a, pro_shop_a)
        response = client.get(f"/api/attendance/list?shopId={pro_shop_b.id}")
        assert response.status_code == 200
        assert response.json()["data"] == []

    def test_super_admin_sees_pro_shops_only(
        self, super_admin, cashier_a, manager_b, pro_shop_a, shop_b
    ):
        shop_b.plan = ShopPlan.FREE
        shop_b.save(update_fields=["plan"])
        free_manager = User.objects.create_user(
            email="free_mgr@test.com",
            password="testpass123",
            name="Free Manager",
            role=Role.MANAGER,
            shop=shop_b,
        )
        Attendance.objects.create(
            user=cashier_a,
            shop=pro_shop_a,
            attendance_date=timezone.localdate(),
            clock_in_at=timezone.now(),
        )
        Attendance.objects.create(
            user=free_manager,
            shop=shop_b,
            attendance_date=timezone.localdate(),
            clock_in_at=timezone.now(),
        )
        client = authed_client(super_admin, pro_shop_a)
        response = client.get("/api/attendance/list")
        assert response.status_code == 200
        assert response.json()["total"] == 1

    def test_manager_free_plan_denied(self, manager_a, shop_a):
        assert shop_a.plan == ShopPlan.FREE
        client = authed_client(manager_a, shop_a)
        response = client.get("/api/attendance/list")
        assert response.status_code == 403
        assert response.json()["code"] == "PRO_PLAN_REQUIRED"

    def test_cashier_cannot_view_sheet(self, cashier_a, pro_shop_a):
        client = authed_client(cashier_a, pro_shop_a)
        assert client.get("/api/attendance/list").status_code == 403

    def test_inventory_officer_cannot_view_sheet(self, inventory_officer_a, pro_shop_a):
        client = authed_client(inventory_officer_a, pro_shop_a)
        assert client.get("/api/attendance/list").status_code == 403

    def test_unauthenticated_cannot_view(self, api_client):
        assert api_client.get("/api/attendance/list").status_code == 401
