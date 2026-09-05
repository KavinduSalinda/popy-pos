from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.attendance.models import Attendance
from apps.attendance.serializers import AttendanceSerializer
from apps.core.choices import Role, ShopPlan
from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import get_accessible_shops
from apps.shops.models import Shop

MARK_ROLES = {Role.MANAGER, Role.CASHIER, Role.INVENTORY_OFFICER}
CLOCK_TYPES = {"in", "out"}


def business_today():
    """Attendance date in the project timezone (UTC today; matches dashboard)."""
    return timezone.localdate()


def pro_required_response():
    return Response(
        {
            "message": "Attendance is available on the Pro plan only.",
            "statusCode": 403,
            "code": "PRO_PLAN_REQUIRED",
        },
        status=status.HTTP_403_FORBIDDEN,
    )


def shop_is_pro(shop: Shop | None) -> bool:
    return bool(shop and shop.plan == ShopPlan.PRO)


class MarkAttendanceView(APIView):
    """POST — clock in or out for today. Body: { \"type\": \"in\" | \"out\" }."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "ATTENDANCE_MARK"
    shop_required = False

    def post(self, request):
        user = request.user
        if user.role not in MARK_ROLES:
            return Response(
                {"message": "Your role cannot mark attendance.", "statusCode": 403},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user.shop_id is None:
            return Response(
                {
                    "message": "You must be assigned to a shop to mark attendance.",
                    "statusCode": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        shop = Shop.objects.filter(pk=user.shop_id).first()
        if not shop_is_pro(shop):
            return pro_required_response()

        raw_type = request.data.get("type") if isinstance(request.data, dict) else None
        clock_type = str(raw_type or "in").strip().lower()
        if clock_type not in CLOCK_TYPES:
            return Response(
                {
                    "message": 'type must be "in" or "out".',
                    "statusCode": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = business_today()
        now = timezone.now()

        if clock_type == "in":
            return self._clock_in(user, shop, today, now)
        return self._clock_out(user, today, now)

    def _clock_in(self, user, shop, today, now):
        existing = Attendance.objects.filter(user=user, attendance_date=today).first()
        if existing and existing.clock_in_at:
            return Response(
                {
                    **AttendanceSerializer(existing).data,
                    "alreadyMarked": True,
                    "action": "in",
                    "statusCode": 200,
                },
                status=status.HTTP_200_OK,
            )

        try:
            with transaction.atomic():
                if existing:
                    existing.clock_in_at = existing.clock_in_at or now
                    existing.save(update_fields=["clock_in_at", "updated_at"])
                    record = existing
                else:
                    record = Attendance.objects.create(
                        user=user,
                        shop=shop,
                        attendance_date=today,
                        clock_in_at=now,
                    )
        except IntegrityError:
            record = Attendance.objects.get(user=user, attendance_date=today)
            if not record.clock_in_at:
                record.clock_in_at = now
                record.save(update_fields=["clock_in_at", "updated_at"])
            return Response(
                {
                    **AttendanceSerializer(record).data,
                    "alreadyMarked": True,
                    "action": "in",
                    "statusCode": 200,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                **AttendanceSerializer(record).data,
                "alreadyMarked": False,
                "action": "in",
                "statusCode": 201,
            },
            status=status.HTTP_201_CREATED,
        )

    def _clock_out(self, user, today, now):
        record = Attendance.objects.filter(user=user, attendance_date=today).first()
        if record is None or not record.clock_in_at:
            return Response(
                {
                    "message": "Clock in before clocking out.",
                    "statusCode": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if record.clock_out_at:
            return Response(
                {
                    **AttendanceSerializer(record).data,
                    "alreadyMarked": True,
                    "action": "out",
                    "statusCode": 200,
                },
                status=status.HTTP_200_OK,
            )

        record.clock_out_at = now
        record.save(update_fields=["clock_out_at", "updated_at"])
        return Response(
            {
                **AttendanceSerializer(record).data,
                "alreadyMarked": False,
                "action": "out",
                "statusCode": 200,
            },
            status=status.HTTP_200_OK,
        )


class MyAttendanceTodayView(APIView):
    """GET — today's clock-in / clock-out status for the authenticated user."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "ATTENDANCE_MARK"
    shop_required = False

    def get(self, request):
        user = request.user
        if user.role not in MARK_ROLES:
            return Response(
                {"message": "Your role cannot mark attendance.", "statusCode": 403},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user.shop_id is None:
            return Response(
                {
                    "message": "You must be assigned to a shop to mark attendance.",
                    "statusCode": 400,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        shop = Shop.objects.filter(pk=user.shop_id).first()
        if not shop_is_pro(shop):
            return pro_required_response()

        today = business_today()
        record = Attendance.objects.filter(user=user, attendance_date=today).first()
        return Response(
            {
                "attendanceDate": today.isoformat(),
                "clockedIn": bool(record and record.clock_in_at),
                "clockedOut": bool(record and record.clock_out_at),
                "marked": bool(record and record.clock_in_at),
                "record": AttendanceSerializer(record).data if record else None,
                "statusCode": 200,
            }
        )


class AttendanceListView(APIView):
    """GET — attendance sheet. Super admin: Pro shops; manager: own Pro shop only."""

    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "ATTENDANCE_VIEW"
    shop_required = False

    def get(self, request):
        user = request.user
        qs = Attendance.objects.select_related("user", "shop").all()

        if user.role == Role.SUPER_ADMIN:
            shop_id = request.query_params.get("shopId") or request.query_params.get(
                "shop_id"
            )
            if shop_id:
                accessible = get_accessible_shops(user).filter(pk=shop_id)
                if not accessible.exists():
                    return Response(
                        {"message": "Shop not found.", "statusCode": 404},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                shop = accessible.first()
                if not shop_is_pro(shop):
                    return pro_required_response()
                qs = qs.filter(shop_id=shop_id)
            else:
                qs = qs.filter(shop__plan=ShopPlan.PRO)
        elif user.role == Role.MANAGER:
            if user.shop_id is None:
                return Response(
                    {
                        "message": "You must be assigned to a shop to view attendance.",
                        "statusCode": 400,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            shop = Shop.objects.filter(pk=user.shop_id).first()
            if not shop_is_pro(shop):
                return pro_required_response()
            qs = qs.filter(shop_id=user.shop_id)
        else:
            return Response(
                {"message": "Not allowed to view attendance.", "statusCode": 403},
                status=status.HTTP_403_FORBIDDEN,
            )

        date_from = request.query_params.get("from") or request.query_params.get(
            "dateFrom"
        )
        date_to = request.query_params.get("to") or request.query_params.get("dateTo")
        if date_from:
            qs = qs.filter(attendance_date__gte=date_from)
        if date_to:
            qs = qs.filter(attendance_date__lte=date_to)

        qs = qs.order_by("-attendance_date", "user__name")

        try:
            page = max(1, int(request.query_params.get("page", 1)))
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = min(100, max(1, int(request.query_params.get("pageSize", 20))))
        except (TypeError, ValueError):
            page_size = 20

        total = qs.count()
        start = (page - 1) * page_size
        rows = qs[start : start + page_size]
        return Response(
            {
                "data": AttendanceSerializer(rows, many=True).data,
                "total": total,
                "page": page,
                "pageSize": page_size,
                "statusCode": 200,
            }
        )
