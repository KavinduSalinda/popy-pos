from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel
from apps.shops.models import Shop


class Attendance(TimeStampedModel):
    """One attendance row per user per business day, with clock-in / clock-out."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    shop = models.ForeignKey(
        Shop,
        on_delete=models.PROTECT,
        related_name="attendance_records",
        help_text="Shop at the time attendance was marked (historical integrity).",
    )
    attendance_date = models.DateField(db_index=True)
    clock_in_at = models.DateTimeField(null=True, blank=True)
    clock_out_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-attendance_date", "-clock_in_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "attendance_date"],
                name="uniq_attendance_user_date",
            ),
        ]
        indexes = [
            models.Index(fields=["shop", "attendance_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} @ {self.shop_id} on {self.attendance_date}"

    @property
    def is_clocked_in(self) -> bool:
        return self.clock_in_at is not None

    @property
    def is_clocked_out(self) -> bool:
        return self.clock_out_at is not None
